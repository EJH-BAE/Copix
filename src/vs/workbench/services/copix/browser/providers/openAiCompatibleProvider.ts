/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { ChatChunk, ChatMessage, ChatRequest, IModelProvider, ToolCall } from '../../common/copixModelProvider.js';

export function createAbortSignal(token: CancellationToken): AbortSignal {
	const controller = new AbortController();
	if (token.isCancellationRequested) {
		controller.abort();
	} else {
		token.onCancellationRequested(() => controller.abort());
	}
	return controller.signal;
}

export interface OpenAiCompatibleProviderOptions {
	id: string;
	label: string;
	baseUrl: string;
	defaultModel: string;
	apiKey?: string;
	supportsToolCalling?: boolean;
}

export abstract class OpenAiCompatibleProvider implements IModelProvider {
	readonly supportsToolCalling: boolean;

	constructor(protected readonly options: OpenAiCompatibleProviderOptions) {
		this.supportsToolCalling = options.supportsToolCalling ?? true;
	}

	get id(): string {
		return this.options.id;
	}

	get label(): string {
		return this.options.label;
	}

	async healthCheck(token: CancellationToken): Promise<boolean> {
		try {
			const url = `${this.normalizeBaseUrl()}/models`;
			const response = await fetch(url, {
				method: 'GET',
				headers: this.getHeaders(),
				signal: createAbortSignal(token),
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	async *streamChat(request: ChatRequest, token: CancellationToken): AsyncIterable<ChatChunk> {
		const url = `${this.normalizeBaseUrl()}/chat/completions`;
		const body: Record<string, unknown> = {
			model: request.model ?? this.options.defaultModel,
			messages: this.toApiMessages(request.messages),
			stream: true,
		};
		if (request.tools?.length && this.supportsToolCalling) {
			body.tools = request.tools;
		}

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				...this.getHeaders(),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
			signal: createAbortSignal(token),
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`${this.label} request failed (${response.status}): ${text}`);
		}

		if (!response.body) {
			throw new Error(`${this.label} returned empty response body`);
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		const pendingToolCalls = new Map<number, ToolCall>();

		try {
			while (true) {
				if (token.isCancellationRequested) {
					break;
				}
				const { done, value } = await reader.read();
				if (done) {
					break;
				}
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() ?? '';

				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed.startsWith('data:')) {
						continue;
					}
					const data = trimmed.slice(5).trim();
					if (!data || data === '[DONE]') {
						continue;
					}
					let parsed: any;
					try {
						parsed = JSON.parse(data);
					} catch {
						continue;
					}
					const delta = parsed.choices?.[0]?.delta;
					if (!delta) {
						continue;
					}
					if (delta.content) {
						yield { type: 'text', content: delta.content };
					}
					if (delta.tool_calls) {
						for (const tc of delta.tool_calls) {
							const index = tc.index ?? 0;
							let existing = pendingToolCalls.get(index);
							if (!existing) {
								existing = {
									id: tc.id ?? `call_${index}`,
									type: 'function',
									function: { name: tc.function?.name ?? '', arguments: '' },
								};
								pendingToolCalls.set(index, existing);
							}
							if (tc.id) {
								existing.id = tc.id;
							}
							if (tc.function?.name) {
								existing.function.name = tc.function.name;
							}
							if (tc.function?.arguments) {
								existing.function.arguments += tc.function.arguments;
							}
						}
					}
				}
			}
		} finally {
			reader.releaseLock();
		}

		for (const toolCall of pendingToolCalls.values()) {
			if (toolCall.function.name) {
				yield { type: 'tool_call', toolCall };
			}
		}
		yield { type: 'done' };
	}

	protected normalizeBaseUrl(): string {
		return this.options.baseUrl.replace(/\/+$/, '');
	}

	protected getHeaders(): Record<string, string> {
		const headers: Record<string, string> = {};
		if (this.options.apiKey) {
			headers['Authorization'] = `Bearer ${this.options.apiKey}`;
		}
		return headers;
	}

	protected toApiMessages(messages: ChatMessage[]): Record<string, unknown>[] {
		return messages.map(m => {
			const msg: Record<string, unknown> = { role: m.role, content: m.content };
			if (m.tool_calls?.length) {
				msg.tool_calls = m.tool_calls;
			}
			if (m.tool_call_id) {
				msg.tool_call_id = m.tool_call_id;
			}
			if (m.name) {
				msg.name = m.name;
			}
			return msg;
		});
	}
}
