/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { ToolDefinition } from '../../common/copixModelProvider.js';

export const COPIX_TOOL_DEFINITIONS: ToolDefinition[] = [
	{
		type: 'function',
		function: {
			name: 'read_file',
			description: 'Read the contents of a file at the given path.',
			parameters: {
				type: 'object',
				properties: {
					path: { type: 'string', description: 'Absolute or workspace-relative file path' },
				},
				required: ['path'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'write_file',
			description: 'Write content to a file, creating it if it does not exist.',
			parameters: {
				type: 'object',
				properties: {
					path: { type: 'string', description: 'Absolute or workspace-relative file path' },
					content: { type: 'string', description: 'Full file content to write' },
				},
				required: ['path', 'content'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'grep',
			description: 'Search for a regex pattern in the workspace.',
			parameters: {
				type: 'object',
				properties: {
					pattern: { type: 'string', description: 'Regex or plain text pattern to search for' },
					path: { type: 'string', description: 'Optional directory or file path to limit search' },
				},
				required: ['pattern'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'run_terminal',
			description: 'Run a shell command in the integrated terminal and return output when available.',
			parameters: {
				type: 'object',
				properties: {
					command: { type: 'string', description: 'Shell command to execute' },
				},
				required: ['command'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'list_dir',
			description: 'List files and directories at a path.',
			parameters: {
				type: 'object',
				properties: {
					path: { type: 'string', description: 'Directory path' },
				},
				required: ['path'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'semantic_search',
			description: 'Semantic search across the indexed codebase for relevant code snippets.',
			parameters: {
				type: 'object',
				properties: {
					query: { type: 'string', description: 'Natural language search query' },
					max_results: { type: 'number', description: 'Maximum number of results (default 10)' },
				},
				required: ['query'],
			},
		},
	},
];

export interface ToolExecutionContext {
	emitStatus(message: string, state: 'active' | 'done' | 'error'): void;
}

export interface CopixToolHandler {
	readonly name: string;
	execute(args: Record<string, unknown>, ctx: ToolExecutionContext): Promise<string>;
}
