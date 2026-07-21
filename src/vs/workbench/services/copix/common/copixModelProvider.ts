/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

export const IModelRouter = createDecorator<IModelRouter>('copixModelRouter');

export interface ChatMessage {
	role: 'system' | 'user' | 'assistant' | 'tool';
	content: string;
	tool_call_id?: string;
	name?: string;
	tool_calls?: ToolCall[];
}

export interface ToolCall {
	id: string;
	type: 'function';
	function: {
		name: string;
		arguments: string;
	};
}

export interface ToolDefinition {
	type: 'function';
	function: {
		name: string;
		description: string;
		parameters: Record<string, unknown>;
	};
}

export interface ChatRequest {
	messages: ChatMessage[];
	tools?: ToolDefinition[];
	model?: string;
}

export type ChatChunk =
	| { type: 'text'; content: string }
	| { type: 'tool_call'; toolCall: ToolCall }
	| { type: 'done' };

export interface IModelProvider {
	readonly id: string;
	readonly label: string;
	readonly supportsToolCalling: boolean;
	healthCheck(token: CancellationToken): Promise<boolean>;
	streamChat(request: ChatRequest, token: CancellationToken): AsyncIterable<ChatChunk>;
}

export type ModelRouting = 'local-first' | 'cloud-only' | 'local-only';

export interface IModelRouter {
	readonly _serviceBrand: undefined;
	getActiveProvider(token: CancellationToken): Promise<IModelProvider | undefined>;
	getLocalProvider(): IModelProvider;
	getCloudProvider(): IModelProvider;
}
