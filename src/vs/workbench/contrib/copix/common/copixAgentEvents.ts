/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

export type AgentStatusState = 'active' | 'done' | 'error';

export type AgentEvent =
	| { type: 'status'; message: string; state: AgentStatusState }
	| { type: 'tool_start'; tool: string; args: unknown }
	| { type: 'tool_end'; tool: string; result: string }
	| { type: 'text_delta'; content: string }
	| { type: 'message_complete'; role: 'assistant' | 'user'; content: string };

export const TOOL_STATUS_LABELS: Record<string, { active: string; done: string }> = {
	read_file: { active: 'Reading file…', done: 'Read file' },
	write_file: { active: 'Editing file…', done: 'Edited file' },
	search_replace: { active: 'Editing file…', done: 'Edited file' },
	grep: { active: 'Searching codebase…', done: 'Searched codebase' },
	glob: { active: 'Searching files…', done: 'Searched files' },
	semantic_search: { active: 'Searching codebase…', done: 'Searched codebase' },
	run_terminal: { active: 'Running script…', done: 'Ran script' },
	list_dir: { active: 'Listing directory…', done: 'Listed directory' },
};
