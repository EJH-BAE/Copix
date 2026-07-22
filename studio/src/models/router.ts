import type { ModelConfig } from './config.js';
import { buildModelHeaders, resolveChatUrl } from './config.js';
import { copix } from '../api.js';
import type { AgentMode } from './agentModes.js';
import { buildSystemPrompt } from './systemPrompt.js';
import { computeLineDiff, truncateText } from '../utils/lineDiff.js';
import { assertSafeFilePath } from '../utils/secrets.js';

export interface AgentContext {
	sessionId: string;
	workspaceRoot: string;
	onWorkspaceChange?: (root: string) => void;
}

interface MultitaskItem {
	tool: string;
	args?: Record<string, unknown>;
}

const TOOLS = [
	{
		type: 'function' as const,
		function: {
			name: 'create_project',
			description: 'Create a new git project/repo from user requirements. Default output root is C:/copix-output unless user specifies outputPath.',
			parameters: {
				type: 'object',
				properties: {
					name: { type: 'string', description: 'Short project name you generate from requirements' },
					description: { type: 'string', description: 'One-line summary of the project' },
					outputPath: { type: 'string', description: 'Optional absolute or relative output directory when user requests a specific route' },
				},
				required: ['name'],
			},
		},
	},
	{
		type: 'function' as const,
		function: {
			name: 'multitask',
			description: 'Run multiple independent tool operations in parallel. Use when tasks do not depend on each other (e.g. read several files at once, run parallel searches).',
			parameters: {
				type: 'object',
				properties: {
					summary: { type: 'string', description: 'Short label for the parallel work' },
					tasks: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								tool: { type: 'string', enum: ['read_file', 'grep', 'list_dir', 'run_terminal'] },
								args: { type: 'object' },
							},
							required: ['tool'],
						},
					},
				},
				required: ['tasks'],
			},
		},
	},
	{
		type: 'function' as const,
		function: {
			name: 'read_file',
			description: 'Read a file. Relative paths use the chat workspace; absolute paths work anywhere on the computer.',
			parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
		},
	},
	{
		type: 'function' as const,
		function: {
			name: 'edit_file',
			description: 'Surgical edit: replace old_string with new_string in a file. Prefer this over write_file for small changes. Use kebab-case paths like src/components/MyComponent.tsx.',
			parameters: {
				type: 'object',
				properties: {
					path: { type: 'string' },
					old_string: { type: 'string' },
					new_string: { type: 'string' },
					replace_all: { type: 'boolean', description: 'Replace every occurrence (default: first only)' },
				},
				required: ['path', 'old_string', 'new_string'],
			},
		},
	},
	{
		type: 'function' as const,
		function: {
			name: 'write_file',
			description: 'Create or overwrite a whole file. Use descriptive paths (e.g. src/app/page.tsx). Parent folders are created automatically.',
			parameters: {
				type: 'object',
				properties: { path: { type: 'string' }, content: { type: 'string' } },
				required: ['path', 'content'],
			},
		},
	},
	{
		type: 'function' as const,
		function: {
			name: 'delete_file',
			description: 'Delete a file from the workspace.',
			parameters: {
				type: 'object',
				properties: { path: { type: 'string' } },
				required: ['path'],
			},
		},
	},
	{
		type: 'function' as const,
		function: {
			name: 'grep',
			description: 'Search files with ripgrep. Optional path (relative or absolute).',
			parameters: {
				type: 'object',
				properties: { pattern: { type: 'string' }, path: { type: 'string' } },
				required: ['pattern'],
			},
		},
	},
	{
		type: 'function' as const,
		function: {
			name: 'list_dir',
			description: 'List directory contents.',
			parameters: { type: 'object', properties: { path: { type: 'string' } } },
		},
	},
	{
		type: 'function' as const,
		function: {
			name: 'run_terminal',
			description:
				'Run a shell command with full machine access. Set elevate=true for Administrator (UAC). Prefer elevate for installs, system config, and protected paths.',
			parameters: {
				type: 'object',
				properties: {
					command: { type: 'string' },
					cwd: { type: 'string' },
					elevate: {
						type: 'boolean',
						description: 'Run elevated as Administrator (Windows UAC prompt)',
					},
				},
				required: ['command'],
			},
		},
	},
];

type ChatMsg = {
	role: 'system' | 'user' | 'assistant' | 'tool';
	content: string;
	tool_call_id?: string;
	name?: string;
	tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>;
};

export type ToolResultMeta = {
	result: string;
	diff?: ReturnType<typeof computeLineDiff>;
};

export type AgentCallbacks = {
	onText: (chunk: string) => void;
	onThinkingStart: () => void;
	onThinkingChunk: (chunk: string) => void;
	onThinkingEnd: () => void;
	onToolStart: (callId: string, tool: string, args: Record<string, unknown>) => void;
	onToolEnd: (callId: string, tool: string, args: Record<string, unknown>, meta: ToolResultMeta) => void;
	onStatus: (msg: string) => void;
};

async function executeTool(
	name: string,
	args: Record<string, unknown>,
	ctx: AgentContext,
): Promise<ToolResultMeta> {
	const ws = ctx.workspaceRoot;
	switch (name) {
		case 'create_project': {
			const projectName = String(args.name ?? 'project');
			assertSafeFilePath(projectName);
			const desc = args.description ? String(args.description) : undefined;
			const outputPath = args.outputPath ? String(args.outputPath) : undefined;
			if (outputPath) assertSafeFilePath(outputPath);
			const result = await copix.createProject(ctx.sessionId, projectName, desc, outputPath);
			ctx.onWorkspaceChange?.(result.root);
			return {
				result: `Created project "${projectName}" at ${result.root}\nFiles: ${result.tree.slice(0, 20).join(', ')}`,
			};
		}
		case 'multitask': {
			const tasks = (args.tasks as MultitaskItem[] | undefined) ?? [];
			const summary = args.summary ? String(args.summary) : 'parallel tasks';
			const results = await Promise.all(tasks.map(async (t, i) => {
				try {
					const meta = await executeTool(t.tool, t.args ?? {}, ctx);
					return `[${i + 1}] ${t.tool}: OK\n${truncateText(meta.result, 800)}`;
				} catch (err) {
					const msg = err instanceof Error ? err.message : String(err);
					return `[${i + 1}] ${t.tool}: ERROR\n${msg}`;
				}
			}));
			return { result: `${summary}\n\n${results.join('\n\n')}` };
		}
		case 'read_file': {
			const filePath = String(args.path ?? '');
			assertSafeFilePath(filePath);
			const content = await copix.readFile(filePath, ws);
			return { result: truncateText(content, 4000) };
		}
		case 'edit_file': {
			const filePath = String(args.path ?? '');
			assertSafeFilePath(filePath);
			const oldStr = String(args.old_string ?? '');
			const newStr = String(args.new_string ?? '');
			const replaceAll = Boolean(args.replace_all);
			const before = await copix.readFile(filePath, ws);
			if (!before.includes(oldStr)) {
				return { result: `Could not find old_string in ${filePath}` };
			}
			const after = replaceAll ? before.split(oldStr).join(newStr) : before.replace(oldStr, newStr);
			const saved = await copix.writeFile(filePath, after, ws);
			return { result: `Patched ${saved}`, diff: computeLineDiff(before, after) };
		}
		case 'write_file': {
			const filePath = String(args.path ?? '');
			assertSafeFilePath(filePath);
			const newContent = String(args.content ?? '');
			let before = '';
			try {
				before = await copix.readFile(filePath, ws);
			} catch { /* new file */ }
			const saved = await copix.writeFile(filePath, newContent, ws);
			const diff = computeLineDiff(before, newContent);
			return { result: `Saved ${saved}`, diff };
		}
		case 'delete_file': {
			const filePath = String(args.path ?? '');
			assertSafeFilePath(filePath);
			const removed = await copix.deleteFile(filePath, ws);
			return { result: `Deleted ${removed}` };
		}
		case 'grep': {
			const out = await copix.grep(
				String(args.pattern ?? ''),
				args.path ? String(args.path) : undefined,
				ws,
			);
			return { result: truncateText(out, 4000) };
		}
		case 'list_dir': {
			const entries = await copix.listDir(args.path ? String(args.path) : undefined, ws);
			return { result: entries.join('\n') || '(empty)' };
		}
		case 'run_terminal': {
			const elevate = Boolean(args.elevate) || needsElevateHint(String(args.command ?? ''));
			const out = await copix.runTerminal(
				String(args.command ?? ''),
				ws,
				args.cwd ? String(args.cwd) : undefined,
				elevate,
			);
			return { result: truncateText(out, 4000) };
		}
		default:
			return { result: `Unknown tool: ${name}` };
	}
}

function needsElevateHint(command: string): boolean {
	const c = command.toLowerCase();
	return /\b(sudo|runas|pkexec|bcdedit|dism\s|reg\s+add|takeown|icacls|winget\s+install|choco\s+install|install-windowsfeature)\b/.test(c);
}

function buildHeaders(config: ModelConfig): Record<string, string> {
	return buildModelHeaders(config);
}

function historyToMessages(messages: Array<{ role: string; content: string }>, maxTurns = 12): ChatMsg[] {
	const filtered = messages
		.filter(m => m.role === 'user' || m.role === 'assistant')
		.map(m => ({
			role: m.role as 'user' | 'assistant',
			content: m.content.length > 6000 ? `${m.content.slice(0, 6000)}\n…[truncated]` : m.content,
		}));
	// Keep recent turns only — large histories crush local model speed/VRAM.
	return filtered.length > maxTurns ? filtered.slice(-maxTurns) : filtered;
}

export interface AgentRunOptions {
	mode?: AgentMode;
	customRules?: string[];
}

export async function runAgent(
	userMessage: string,
	config: ModelConfig,
	ctx: AgentContext,
	priorMessages: Array<{ role: string; content: string }>,
	signal: AbortSignal,
	callbacks: AgentCallbacks,
	options: AgentRunOptions = {},
): Promise<void> {
	const isLocal = config.provider === 'local';
	const messages: ChatMsg[] = [
		{
			role: 'system',
			content: buildSystemPrompt({
				mode: options.mode ?? 'code',
				workspaceRoot: ctx.workspaceRoot,
				customRules: options.customRules,
			}),
		},
		...historyToMessages(priorMessages, isLocal ? 8 : 16),
		{ role: 'user', content: userMessage },
	];

	const url = resolveChatUrl(config);
	const maxRounds = isLocal ? 10 : 16;

	for (let i = 0; i < maxRounds; i++) {
		if (signal.aborted) return;
		callbacks.onStatus(`${config.model}…`);
		let thinking = true;
		callbacks.onThinkingStart();
		const endThinking = () => {
			if (!thinking) return;
			thinking = false;
			callbacks.onThinkingEnd();
		};

		let res: Response;
		try {
			res = await fetch(url, {
				method: 'POST',
				headers: buildHeaders(config),
				body: JSON.stringify({
					model: config.model,
					messages,
					tools: TOOLS,
					stream: true,
					temperature: isLocal ? 0.1 : 0.2,
					...(isLocal
						? {
							options: {
								...(config.numCtx != null ? { num_ctx: config.numCtx } : { num_ctx: 4096 }),
								num_predict: 2048,
								num_batch: 512,
								keep_alive: '10m',
							},
						}
						: {}),
				}),
				signal,
			});
		} catch (err) {
			if (signal.aborted) return;
			const msg = err instanceof Error ? err.message : String(err);
			const label = config.provider === 'cloud' ? 'Copix Cloud' : 'Ollama';
			throw new Error(`Cannot reach ${label} at ${config.baseUrl} — ${msg}`);
		}

		if (!res.ok) {
			const errText = await res.text().catch(() => '');
			const label = config.provider === 'cloud' ? 'Copix Cloud' : 'Ollama';
			let message = errText.slice(0, 800) || res.statusText;
			try {
				const parsed = JSON.parse(errText) as { error?: { message?: string } };
				if (parsed.error?.message) message = parsed.error.message;
			} catch { /* raw text */ }
			throw new Error(`${label} ${res.status}: ${message}`);
		}

		const reader = res.body!.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		let assistantText = '';
		const toolCalls = new Map<number, { id: string; name: string; args: string }>();

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop() ?? '';
			for (const line of lines) {
				if (!line.startsWith('data: ')) continue;
				const payload = line.slice(6).trim();
				if (payload === '[DONE]') continue;
				try {
					const json = JSON.parse(payload);
					const delta = json.choices?.[0]?.delta;
					const reasoning = delta?.reasoning_content ?? delta?.reasoning;
					if (reasoning) {
						callbacks.onThinkingChunk(String(reasoning));
					}
					if (delta?.content) {
						endThinking();
						assistantText += delta.content;
						callbacks.onText(delta.content);
					}
					for (const tc of delta?.tool_calls ?? []) {
						if (tc.function?.name) endThinking();
						const idx = tc.index ?? 0;
						if (!toolCalls.has(idx)) toolCalls.set(idx, { id: tc.id ?? `c${idx}`, name: '', args: '' });
						const e = toolCalls.get(idx)!;
						if (tc.function?.name) e.name = tc.function.name;
						if (tc.function?.arguments) e.args += tc.function.arguments;
					}
				} catch { /* skip */ }
			}
		}

		endThinking();

		if (!toolCalls.size) {
			messages.push({ role: 'assistant', content: assistantText });
			callbacks.onStatus('');
			return;
		}

		const calls = [...toolCalls.values()];
		messages.push({
			role: 'assistant',
			content: assistantText,
			tool_calls: calls.map(c => ({
				id: c.id,
				type: 'function' as const,
				function: { name: c.name, arguments: c.args },
			})),
		});

		for (const call of calls) {
			let args: Record<string, unknown> = {};
			try { args = JSON.parse(call.args || '{}'); } catch { /* empty */ }
			callbacks.onToolStart(call.id, call.name, args);
			let meta: ToolResultMeta;
			try {
				meta = await executeTool(call.name, args, ctx);
			} catch (err) {
				meta = { result: err instanceof Error ? err.message : String(err) };
			}
			callbacks.onToolEnd(call.id, call.name, args, meta);
			messages.push({ role: 'tool', content: meta.result, tool_call_id: call.id, name: call.name });
		}
	}
	callbacks.onStatus('');
}
