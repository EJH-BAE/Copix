/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

export interface ICopixAgentProgress {
	onTextDelta?(content: string): void;
	onStatus?(message: string, state: 'active' | 'done' | 'error'): void;
	onToolStart?(tool: string, label: string): void;
	onToolEnd?(tool: string, label: string): void;
	onMessageComplete?(role: 'user' | 'assistant', content: string): void;
}

export function getCopixToolLabel(tool: string, phase: 'active' | 'done'): string {
	const labels: Record<string, { active: string; done: string }> = {
		read_file: { active: 'Reading file…', done: 'Read file' },
		write_file: { active: 'Editing file…', done: 'Edited file' },
		grep: { active: 'Searching codebase…', done: 'Searched codebase' },
		run_terminal: { active: 'Running script…', done: 'Ran script' },
		list_dir: { active: 'Listing directory…', done: 'Listed directory' },
		semantic_search: { active: 'Searching codebase…', done: 'Searched codebase' },
	};
	return labels[tool]?.[phase] ?? `${tool}…`;
}
