/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ITerminalService } from '../../../contrib/terminal/browser/terminal.js';
import { ICopixFilesystemService } from '../common/copixFilesystemService.js';
import { ICopixIndexService } from '../common/copixIndexService.js';
import { ICopixToolExecutor } from '../common/copixToolExecutorService.js';
import { QueryType } from '../../search/common/search.js';
import { ISearchService } from '../../search/common/search.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../editor/common/editorService.js';

export class CopixToolExecutor implements ICopixToolExecutor {
	declare readonly _serviceBrand: undefined;

	constructor(
		@ICopixFilesystemService private readonly filesystemService: ICopixFilesystemService,
		@ISearchService private readonly searchService: ISearchService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
		@ITerminalService private readonly terminalService: ITerminalService,
		@ICopixIndexService private readonly indexService: ICopixIndexService,
		@IEditorService private readonly editorService: IEditorService,
	) { }

	async readFile(args: Record<string, unknown>): Promise<string> {
		const uri = this.filesystemService.resolvePath(String(args.path ?? ''));
		if (!await this.ensureAccess(uri)) {
			return 'Error: access to path denied by user';
		}
		return this.filesystemService.readFileText(uri);
	}

	async writeFile(args: Record<string, unknown>): Promise<string> {
		const uri = this.filesystemService.resolvePath(String(args.path ?? ''));
		if (!await this.ensureAccess(uri)) {
			return 'Error: access to path denied by user';
		}
		await this.filesystemService.writeFileText(uri, String(args.content ?? ''));
		await this.editorService.openEditor({ resource: uri });
		return `Wrote ${uri.fsPath}`;
	}

	async grep(args: Record<string, unknown>, token: CancellationToken): Promise<string> {
		const pattern = String(args.pattern ?? '');
		const folders = this.workspaceContextService.getWorkspace().folders;
		if (!folders.length) {
			return 'No workspace folder open';
		}
		const query = {
			type: QueryType.Text,
			folderQueries: folders.map(f => ({ folder: f.uri })),
			contentPattern: { pattern, isRegExp: false },
			maxResults: 50,
		};
		const result = await this.searchService.textSearch(query, token);
		const lines: string[] = [];
		for (const fileMatch of result.results.slice(0, 50)) {
			const first = fileMatch.results?.[0];
			if (first && 'previewText' in first) {
				lines.push(`${fileMatch.resource.fsPath}: ${first.previewText.trim()}`);
			} else {
				lines.push(fileMatch.resource.fsPath);
			}
		}
		return lines.join('\n') || 'No matches found';
	}

	async runTerminal(args: Record<string, unknown>): Promise<string> {
		const command = String(args.command ?? '');
		const terminal = await this.terminalService.createTerminal({ name: 'Copix Agent' });
		terminal.show(true);
		await terminal.sendText(command, true);
		return `Command sent to terminal: ${command}`;
	}

	async listDir(args: Record<string, unknown>): Promise<string> {
		const uri = this.filesystemService.resolvePath(String(args.path ?? '.'));
		if (!await this.ensureAccess(uri)) {
			return 'Error: access to path denied by user';
		}
		const entries = await this.filesystemService.listDirectory(uri);
		return entries.join('\n');
	}

	async semanticSearch(args: Record<string, unknown>, token: CancellationToken): Promise<string> {
		const query = String(args.query ?? '');
		const maxResults = Number(args.max_results ?? 12);
		const results = await this.indexService.semanticSearch(query, maxResults, token);
		if (!results.length) {
			return 'No semantic matches found. Ensure the workspace is indexed and Ollama embeddings are available.';
		}
		return results.map(r => `${r.path} (score ${r.score.toFixed(2)})\n${r.snippet}`).join('\n\n');
	}

	private async ensureAccess(uri: ReturnType<ICopixFilesystemService['resolvePath']>): Promise<boolean> {
		if (this.filesystemService.isPathAllowed(uri)) {
			return true;
		}
		return this.filesystemService.requestPathAccess(uri);
	}
}
