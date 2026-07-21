/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

export const CopixToolIds = {
	readFile: 'copix_read_file',
	writeFile: 'copix_write_file',
	grep: 'copix_grep',
	runTerminal: 'copix_run_terminal',
	listDir: 'copix_list_dir',
	semanticSearch: 'copix_semantic_search',
} as const;

/** OpenAI function names emitted by the model → registered tool ids */
export const COPIX_MODEL_TOOL_TO_ID: Record<string, string> = {
	read_file: CopixToolIds.readFile,
	write_file: CopixToolIds.writeFile,
	grep: CopixToolIds.grep,
	run_terminal: CopixToolIds.runTerminal,
	list_dir: CopixToolIds.listDir,
	semantic_search: CopixToolIds.semanticSearch,
};

export function resolveCopixToolId(modelToolName: string): string {
	return COPIX_MODEL_TOOL_TO_ID[modelToolName] ?? modelToolName;
}
