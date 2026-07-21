/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { CopixToolHandler, ToolExecutionContext } from './copixTools.js';
import { ICopixToolExecutor } from '../common/copixToolExecutorService.js';

export class CopixToolRegistry {
	private readonly handlers = new Map<string, CopixToolHandler>();

	constructor(
		private readonly executor: ICopixToolExecutor,
	) {
		this.register({
			name: 'read_file',
			execute: (args, _ctx) => this.executor.readFile(args),
		});
		this.register({
			name: 'write_file',
			execute: (args, _ctx) => this.executor.writeFile(args),
		});
		this.register({
			name: 'grep',
			execute: (args, _ctx) => this.executor.grep(args, CancellationToken.None),
		});
		this.register({
			name: 'run_terminal',
			execute: (args, _ctx) => this.executor.runTerminal(args),
		});
		this.register({
			name: 'list_dir',
			execute: (args, _ctx) => this.executor.listDir(args),
		});
		this.register({
			name: 'semantic_search',
			execute: (args, _ctx) => this.executor.semanticSearch(args, CancellationToken.None),
		});
	}

	getHandler(name: string): CopixToolHandler | undefined {
		return this.handlers.get(name);
	}

	private register(handler: CopixToolHandler): void {
		this.handlers.set(handler.name, handler);
	}
}
