/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ICopixIndexService, SemanticSearchResult } from '../common/copixIndexService.js';

interface IndexedChunk {
	path: string;
	content: string;
	terms: Set<string>;
}

export class CopixIndexService implements ICopixIndexService {
	declare readonly _serviceBrand: undefined;

	private chunks: IndexedChunk[] = [];

	constructor(
		@IFileService private readonly fileService: IFileService,
		@ILogService private readonly logService: ILogService,
	) { }

	async indexWorkspace(root: URI, token: CancellationToken): Promise<void> {
		this.chunks = [];
		await this.walkDirectory(root, token);
		this.logService.info(`[Copix] Indexed ${this.chunks.length} code chunks`);
	}

	async semanticSearch(query: string, maxResults: number, token: CancellationToken): Promise<SemanticSearchResult[]> {
		if (token.isCancellationRequested) {
			return [];
		}
		const queryTerms = this.tokenize(query);
		if (!queryTerms.length) {
			return [];
		}
		const scored: SemanticSearchResult[] = [];
		for (const chunk of this.chunks) {
			let score = 0;
			for (const term of queryTerms) {
				if (chunk.terms.has(term)) {
					score += 1;
				}
				if (chunk.content.toLowerCase().includes(term)) {
					score += 0.5;
				}
			}
			if (score > 0) {
				scored.push({
					path: chunk.path,
					score,
					snippet: chunk.content.slice(0, 300),
				});
			}
		}
		scored.sort((a, b) => b.score - a.score);
		return scored.slice(0, maxResults);
	}

	private async walkDirectory(uri: URI, token: CancellationToken): Promise<void> {
		if (token.isCancellationRequested) {
			return;
		}
		let stat;
		try {
			stat = await this.fileService.resolve(uri, { resolveMetadata: true });
		} catch {
			return;
		}
		if (stat.isDirectory && stat.children) {
			for (const child of stat.children) {
				if (child.name.startsWith('.') || child.name === 'node_modules') {
					continue;
				}
				await this.walkDirectory(child.resource, token);
			}
			return;
		}
		if (!this.isIndexableFile(uri.fsPath)) {
			return;
		}
		try {
			const file = await this.fileService.readFile(uri);
			const text = file.value.toString();
			this.chunks.push({
				path: uri.fsPath,
				content: text,
				terms: new Set(this.tokenize(text)),
			});
		} catch {
			// skip unreadable files
		}
	}

	private isIndexableFile(path: string): boolean {
		return /\.(ts|tsx|js|jsx|py|go|rs|java|cpp|c|h|cs|md|json|yaml|yml|toml|css|html)$/i.test(path);
	}

	private tokenize(text: string): string[] {
		return text.toLowerCase()
			.split(/[^a-z0-9_]+/g)
			.filter(t => t.length > 2)
			.slice(0, 500);
	}
}
