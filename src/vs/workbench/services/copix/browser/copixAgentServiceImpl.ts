/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Emitter } from '../../../../base/common/event.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { AgentEvent } from '../../../contrib/copix/common/copixAgentEvents.js';
import { ILanguageModelToolsService, CountTokensCallback } from '../../../contrib/chat/common/tools/languageModelToolsService.js';
import { ICopixAgentRunContext } from '../common/copixAgentRunContext.js';
import { resolveCopixToolId } from '../common/copixToolIds.js';
import { ICopixAgentService } from '../common/copixAgentService.js';
import { ChatMessage, IModelRouter, ToolCall } from '../common/copixModelProvider.js';
import { CopixContextBuilder } from './copixContextBuilder.js';
import { CopixToolRegistry } from './tools/copixToolRegistry.js';
import { COPIX_TOOL_DEFINITIONS } from './tools/copixTools.js';
import { ICopixToolExecutor } from '../common/copixToolExecutorService.js';
import { ICopixFilesystemService } from '../common/copixFilesystemService.js';

const MAX_TOOL_ITERATIONS = 12;

const noopCountTokens: CountTokensCallback = async () => 0;

export class CopixAgentService implements ICopixAgentService {
	declare readonly _serviceBrand: undefined;

	private readonly _onDidEmitEvent = new Emitter<AgentEvent>();
	readonly onDidEmitEvent = this._onDidEmitEvent.event;

	private _isRunning = false;
	private activeCts: CancellationTokenSource | undefined;
	private readonly conversationHistory: ChatMessage[] = [];
	private readonly displayHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
	private readonly toolRegistry: CopixToolRegistry;
	private readonly contextBuilder: CopixContextBuilder;

	constructor(
		@IModelRouter private readonly modelRouter: IModelRouter,
		@ICopixToolExecutor private readonly toolExecutor: ICopixToolExecutor,
		@ILanguageModelToolsService private readonly languageModelToolsService: ILanguageModelToolsService,
		@IEditorService editorService: IEditorService,
		@ICopixFilesystemService filesystemService: ICopixFilesystemService,
	) {
		this.toolRegistry = new CopixToolRegistry(this.toolExecutor);
		this.contextBuilder = new CopixContextBuilder(editorService, filesystemService);
	}

	get isRunning(): boolean {
		return this._isRunning;
	}

	getHistory(): ReadonlyArray<{ role: 'user' | 'assistant'; content: string }> {
		return this.displayHistory;
	}

	clearHistory(): void {
		this.conversationHistory.length = 0;
		this.displayHistory.length = 0;
	}

	cancel(): void {
		this.activeCts?.cancel();
	}

	async sendMessage(message: string, token: CancellationToken, context?: ICopixAgentRunContext): Promise<void> {
		if (this._isRunning) {
			throw new Error('Agent is already running');
		}

		this._isRunning = true;
		this.activeCts = new CancellationTokenSource();
		const merged = this.activeCts.token;
		const cancelOnParent = token.onCancellationRequested(() => this.activeCts?.cancel());

		this.displayHistory.push({ role: 'user', content: message });
		this._onDidEmitEvent.fire({ type: 'message_complete', role: 'user', content: message });
		context?.onMessageComplete?.('user', message);

		let assistantText = '';

		try {
			const provider = await this.modelRouter.getActiveProvider(merged);
			if (!provider) {
				const err = 'No model available. Start Ollama (`ollama serve`) or configure a cloud API key in Copix settings.';
				this._onDidEmitEvent.fire({ type: 'status', message: err, state: 'error' });
				context?.onStatus?.(err, 'error');
				this.displayHistory.push({ role: 'assistant', content: err });
				this._onDidEmitEvent.fire({ type: 'message_complete', role: 'assistant', content: err });
				context?.onMessageComplete?.('assistant', err);
				return;
			}

			const usingMsg = `Using ${provider.label}…`;
			this._onDidEmitEvent.fire({ type: 'status', message: usingMsg, state: 'active' });
			context?.onStatus?.(usingMsg, 'active');

			const workingMessages = await this.contextBuilder.buildMessages(message, this.conversationHistory, context?.attachments);
			this.conversationHistory.push({ role: 'user', content: message });

			for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
				if (merged.isCancellationRequested) {
					break;
				}

				const toolCalls: ToolCall[] = [];
				let iterationText = '';

				for await (const chunk of provider.streamChat({
					messages: workingMessages,
					tools: COPIX_TOOL_DEFINITIONS,
				}, merged)) {
					if (chunk.type === 'text') {
						iterationText += chunk.content;
						assistantText += chunk.content;
						this._onDidEmitEvent.fire({ type: 'text_delta', content: chunk.content });
						context?.onTextDelta?.(chunk.content);
					} else if (chunk.type === 'tool_call') {
						toolCalls.push(chunk.toolCall);
					}
				}

				if (!toolCalls.length) {
					if (iterationText) {
						this.conversationHistory.push({ role: 'assistant', content: iterationText });
					}
					break;
				}

				const assistantMessage: ChatMessage = {
					role: 'assistant',
					content: iterationText || '',
					tool_calls: toolCalls,
				};
				workingMessages.push(assistantMessage);
				this.conversationHistory.push(assistantMessage);

				for (const toolCall of toolCalls) {
					const toolName = toolCall.function.name;
					let args: Record<string, unknown> = {};
					try {
						args = JSON.parse(toolCall.function.arguments || '{}');
					} catch {
						args = {};
					}

					this._onDidEmitEvent.fire({ type: 'tool_start', tool: toolName, args });

					let result: string;
					const toolId = resolveCopixToolId(toolName);
					const useNativeTools = !!(context?.sessionResource && this.languageModelToolsService.getTool(toolId));
					if (useNativeTools) {
						try {
							const toolResult = await this.languageModelToolsService.invokeTool({
								callId: toolCall.id,
								toolId,
								parameters: args,
								chatRequestId: context.requestId,
								context: { sessionResource: context.sessionResource! },
							}, noopCountTokens, merged);
							result = toolResult.content
								.filter(p => p.kind === 'text')
								.map(p => p.value)
								.join('\n');
						} catch (err) {
							result = err instanceof Error ? err.message : String(err);
						}
					} else {
						context?.onToolStart?.(toolName, toolName);
						const handler = this.toolRegistry.getHandler(toolName);
						if (!handler) {
							result = `Unknown tool: ${toolName}`;
						} else {
							result = await handler.execute(args, { emitStatus: () => { } });
						}
						context?.onToolEnd?.(toolName, toolName);
					}

					this._onDidEmitEvent.fire({ type: 'tool_end', tool: toolName, result });

					const toolMessage: ChatMessage = {
						role: 'tool',
						content: result,
						tool_call_id: toolCall.id,
						name: toolName,
					};
					workingMessages.push(toolMessage);
					this.conversationHistory.push(toolMessage);
				}
			}

			this._onDidEmitEvent.fire({ type: 'status', message: 'Done', state: 'done' });
			context?.onStatus?.('Done', 'done');
			const finalText = assistantText || '(completed with tools)';
			this.displayHistory.push({ role: 'assistant', content: finalText });
			this._onDidEmitEvent.fire({ type: 'message_complete', role: 'assistant', content: assistantText });
			context?.onMessageComplete?.('assistant', finalText);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			this._onDidEmitEvent.fire({ type: 'status', message: msg, state: 'error' });
			context?.onStatus?.(msg, 'error');
			this.displayHistory.push({ role: 'assistant', content: msg });
			this._onDidEmitEvent.fire({ type: 'message_complete', role: 'assistant', content: msg });
			context?.onMessageComplete?.('assistant', msg);
		} finally {
			cancelOnParent.dispose();
			this._isRunning = false;
			this.activeCts = undefined;
		}
	}
}
