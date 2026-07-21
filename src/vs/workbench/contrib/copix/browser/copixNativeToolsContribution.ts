/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { localize } from '../../../../nls.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { createToolSimpleTextResult } from '../../chat/common/tools/builtinTools/toolHelpers.js';
import { CountTokensCallback, ILanguageModelToolsService, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolDataSource, ToolProgress } from '../../chat/common/tools/languageModelToolsService.js';
import { CopixToolIds } from '../../../services/copix/common/copixToolIds.js';
import { ICopixToolExecutor } from '../../../services/copix/common/copixToolExecutorService.js';

type CopixNativeToolDef = {
	id: string;
	toolReferenceName?: string;
	displayName: string;
	userDescription: string;
	modelDescription: string;
	icon: ThemeIcon;
	schema: IToolData['inputSchema'];
	run: (executor: ICopixToolExecutor, args: Record<string, unknown>, token: CancellationToken) => Promise<string>;
	invocationMessage?: (args: Record<string, unknown>) => string;
};

const COPIX_NATIVE_TOOLS: CopixNativeToolDef[] = [
	{
		id: CopixToolIds.readFile,
		toolReferenceName: 'read',
		displayName: localize('copix.tool.readFile', 'Read File'),
		userDescription: localize('copix.tool.readFile.user', 'Read a file from the workspace'),
		modelDescription: 'Read the full contents of a file at the given path.',
		icon: ThemeIcon.fromId(Codicon.file.id),
		schema: {
			type: 'object',
			properties: {
				path: { type: 'string', description: 'Absolute or workspace-relative file path' },
			},
			required: ['path'],
		},
		run: (e, args) => e.readFile(args),
		invocationMessage: args => localize('copix.tool.readFile.invocation', 'Reading `{0}`', String(args.path ?? '')),
	},
	{
		id: CopixToolIds.writeFile,
		toolReferenceName: 'write',
		displayName: localize('copix.tool.writeFile', 'Write File'),
		userDescription: localize('copix.tool.writeFile.user', 'Write or replace a file'),
		modelDescription: 'Write full file content. Prefer reading the file first when editing existing code.',
		icon: ThemeIcon.fromId(Codicon.edit.id),
		schema: {
			type: 'object',
			properties: {
				path: { type: 'string', description: 'Absolute or workspace-relative file path' },
				content: { type: 'string', description: 'Full file content to write' },
			},
			required: ['path', 'content'],
		},
		run: (e, args) => e.writeFile(args),
		invocationMessage: args => localize('copix.tool.writeFile.invocation', 'Editing `{0}`', String(args.path ?? '')),
	},
	{
		id: CopixToolIds.grep,
		toolReferenceName: 'grep',
		displayName: localize('copix.tool.grep', 'Search Codebase'),
		userDescription: localize('copix.tool.grep.user', 'Text search in the workspace'),
		modelDescription: 'Search for a text pattern across the workspace (ripgrep-style).',
		icon: ThemeIcon.fromId(Codicon.search.id),
		schema: {
			type: 'object',
			properties: {
				pattern: { type: 'string', description: 'Text or regex pattern to search for' },
				path: { type: 'string', description: 'Optional folder or file to limit search' },
			},
			required: ['pattern'],
		},
		run: (e, args, token) => e.grep(args, token),
		invocationMessage: args => localize('copix.tool.grep.invocation', 'Searching for `{0}`', String(args.pattern ?? '')),
	},
	{
		id: CopixToolIds.semanticSearch,
		toolReferenceName: 'codebase',
		displayName: localize('copix.tool.codebase', 'Codebase Search'),
		userDescription: localize('copix.tool.codebase.user', 'Semantic search over the indexed workspace (@codebase)'),
		modelDescription: 'Semantic search over the indexed workspace. Use for high-level questions about where logic lives.',
		icon: ThemeIcon.fromId(Codicon.searchSparkle.id),
		schema: {
			type: 'object',
			properties: {
				query: { type: 'string', description: 'Natural language search query' },
				max_results: { type: 'number', description: 'Maximum number of results (default 12)' },
			},
			required: ['query'],
		},
		run: (e, args, token) => e.semanticSearch(args, token),
		invocationMessage: args => localize('copix.tool.codebase.invocation', 'Searching codebase for `{0}`', String(args.query ?? '')),
	},
	{
		id: CopixToolIds.listDir,
		toolReferenceName: 'list',
		displayName: localize('copix.tool.listDir', 'List Directory'),
		userDescription: localize('copix.tool.listDir.user', 'List files in a directory'),
		modelDescription: 'List files and folders at a path.',
		icon: ThemeIcon.fromId(Codicon.folder.id),
		schema: {
			type: 'object',
			properties: {
				path: { type: 'string', description: 'Directory path (default: workspace root)' },
			},
		},
		run: (e, args) => e.listDir(args),
		invocationMessage: args => localize('copix.tool.listDir.invocation', 'Listing `{0}`', String(args.path ?? '.')),
	},
	{
		id: CopixToolIds.runTerminal,
		toolReferenceName: 'terminal',
		displayName: localize('copix.tool.terminal', 'Run Terminal Command'),
		userDescription: localize('copix.tool.terminal.user', 'Run a shell command'),
		modelDescription: 'Run a command in the integrated terminal.',
		icon: ThemeIcon.fromId(Codicon.terminal.id),
		schema: {
			type: 'object',
			properties: {
				command: { type: 'string', description: 'Shell command to execute' },
			},
			required: ['command'],
		},
		run: (e, args) => e.runTerminal(args),
		invocationMessage: args => localize('copix.tool.terminal.invocation', 'Running `{0}`', String(args.command ?? '')),
	},
];

class CopixNativeToolImpl implements IToolImpl {
	constructor(
		private readonly def: CopixNativeToolDef,
		private readonly executor: ICopixToolExecutor,
	) { }

	async prepareToolInvocation(context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined> {
		const args = context.parameters as Record<string, unknown>;
		return {
			invocationMessage: this.def.invocationMessage?.(args),
		};
	}

	async invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, progress: ToolProgress, token: CancellationToken): Promise<IToolResult> {
		try {
			const result = await this.def.run(this.executor, invocation.parameters, token);
			return createToolSimpleTextResult(result);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			progress.report({ message });
			return createToolSimpleTextResult(`Error: ${message}`);
		}
	}
}

export class CopixNativeToolsContribution implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.copixNativeTools';

	private readonly _store = new DisposableStore();

	constructor(
		@ILanguageModelToolsService toolsService: ILanguageModelToolsService,
		@ICopixToolExecutor executor: ICopixToolExecutor,
	) {
		for (const def of COPIX_NATIVE_TOOLS) {
			const data: IToolData = {
				id: def.id,
				source: ToolDataSource.Internal,
				toolReferenceName: def.toolReferenceName,
				canBeReferencedInPrompt: !!def.toolReferenceName,
				icon: def.icon,
				displayName: def.displayName,
				userDescription: def.userDescription,
				modelDescription: def.modelDescription,
				inputSchema: def.schema,
				runsInWorkspace: true,
				canRequestPreApproval: def.id === CopixToolIds.writeFile || def.id === CopixToolIds.runTerminal,
			};
			const impl = new CopixNativeToolImpl(def, executor);
			this._store.add(toolsService.registerTool(data, impl));
			this._store.add(toolsService.agentToolSet.addTool(data));
			if (def.toolReferenceName === 'read' || def.toolReferenceName === 'codebase') {
				this._store.add(toolsService.readToolSet.addTool(data));
			}
		}
	}

	dispose(): void {
		this._store.dispose();
	}
}
