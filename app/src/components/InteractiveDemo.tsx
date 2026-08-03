import {
	FormEvent,
	useEffect,
	useRef,
	useState,
	type Dispatch,
	type SetStateAction,
} from 'react';

type StatusLine = { kind: 'status'; text: string; done?: boolean };
type FilePill = { kind: 'file'; name: string; delta: string };
type Bubble = { kind: 'user' | 'agent'; text: string; streaming?: boolean };
type Question = {
	kind: 'question';
	title: string;
	prompt: string;
	options: string[];
	selected: number | null;
};
type DemoItem = StatusLine | FilePill | Bubble | Question;

type EditorSnap = {
	tab: string;
	path: string;
	title: string;
	body: string[];
	tasksDone: number;
};

type SceneId = 'studio' | 'cli';

const scenes: Record<
	SceneId,
	{
		label: string;
		chrome: string;
		history: { title: string; when: string; done: boolean }[];
		tasks: string[];
		script: DemoItem[];
		editorSnaps: EditorSnap[];
		defaultChoice: number;
		reply: (choice: string) => string;
		followUps: DemoItem[];
	}
> = {
	studio: {
		label: 'Desktop',
		chrome: 'Copix Desktop',
		history: [
			{ title: 'Landing page creation', when: '2h', done: true },
			{ title: 'Mission Control Plan', when: 'Now', done: false },
			{ title: 'PyTorch MNIST Experiment', when: '1d', done: true },
			{ title: 'Bioinformatics Tools', when: '3d', done: true },
		],
		tasks: [
			'Add expose modes to useAppStore.ts',
			'Create MissionControlView.tsx',
			'Update AppManager.tsx for triggers',
		],
		script: [
			{ kind: 'user', text: 'Plan a Mission Control interface for macOS Studio' },
			{ kind: 'status', text: 'Thinking' },
			{ kind: 'status', text: 'Reading AppManager.tsx' },
			{ kind: 'status', text: 'Searched codebase for expose patterns' },
			{ kind: 'file', name: 'feature-prd.md', delta: '+68' },
			{
				kind: 'agent',
				text: 'Drafted a Mission Control plan: grid overview of open windows, MenuBar entry, and keyboard trigger. One choice left before I build.',
			},
			{
				kind: 'question',
				title: 'Question',
				prompt: 'How should Mission Control be triggered?',
				options: [
					'Gesture (swipe up with 3 fingers)',
					'Keyboard shortcut (F3 or ⌘F3)',
					'Both keyboard and menu button',
				],
				selected: null,
			},
		],
		editorSnaps: [
			{
				tab: 'feature-prd.md',
				path: 'Plans › feature-prd.md',
				title: 'Mission Control Interface',
				body: [
					'Overview of open Studio windows in a grid.',
					'Triggers undecided — waiting on your choice.',
					'Reuse expose-style layout from AppManager.',
				],
				tasksDone: 0,
			},
			{
				tab: 'MissionControlView.tsx',
				path: 'src › MissionControlView.tsx',
				title: 'MissionControlView',
				body: [
					'export function MissionControlView() {',
					'  return <ExposeGrid triggers={["menu", "F3"]} />',
					'}',
				],
				tasksDone: 2,
			},
			{
				tab: 'AppManager.tsx',
				path: 'src › AppManager.tsx',
				title: 'AppManager triggers',
				body: [
					'registerShortcut("F3", openMissionControl)',
					'menuBar.add("Window › Mission Control")',
				],
				tasksDone: 3,
			},
		],
		defaultChoice: 2,
		reply: (choice) =>
			`Got it — trigger via ${choice}. Wiring MenuBar + F3 and keeping the grid overview in MissionControlView.`,
		followUps: [
			{ kind: 'file', name: 'AppManager.tsx', delta: '+24' },
			{ kind: 'file', name: 'MissionControlView.tsx', delta: '+112' },
			{ kind: 'status', text: 'Ran tests · 3 passed', done: true },
		],
	},
	cli: {
		label: 'CLI',
		chrome: 'copix agent',
		history: [
			{ title: 'Wire CLI install for Windows', when: 'Now', done: false },
			{ title: 'Ship macOS curl installer', when: '5h', done: true },
			{ title: 'Ollama model fallback', when: '1d', done: true },
		],
		tasks: [
			'Add install.ps1 PATH shim',
			'Vendor agent under cli/agent',
			'Document curl | bash + irm | iex',
		],
		script: [
			{ kind: 'user', text: 'Make the CLI installable on Windows and macOS — no account' },
			{ kind: 'status', text: 'Thinking' },
			{ kind: 'status', text: 'Reading cli/install.sh' },
			{ kind: 'status', text: 'Checked Node PATH on win32' },
			{ kind: 'file', name: 'install.ps1', delta: '+96' },
			{
				kind: 'agent',
				text: 'Plan: keep curl|bash for macOS/Linux, add install.ps1 for Windows with a copix.cmd shim, and ship a standalone agent under cli/agent so Desktop sources are not required.',
			},
			{
				kind: 'question',
				title: 'Question',
				prompt: 'Default model after first install?',
				options: [
					'qwen2.5:3b (fast local default)',
					'qwen2.5-coder:7b (heavier)',
					'Leave unset — user runs /pull',
				],
				selected: null,
			},
		],
		editorSnaps: [
			{
				tab: 'install.ps1',
				path: 'cli › install.ps1',
				title: 'Windows installer',
				body: [
					'irm .../cli/install.ps1 | iex',
					'Writes copix.cmd to ~/.local/bin',
					'Adds user PATH automatically',
				],
				tasksDone: 1,
			},
			{
				tab: 'install.sh',
				path: 'cli › install.sh',
				title: 'macOS / Linux installer',
				body: [
					'curl -fsSL .../cli/install.sh | bash',
					'Symlinks ~/.local/bin/copix',
					'Seeds ~/Copix/settings.json',
				],
				tasksDone: 2,
			},
			{
				tab: 'README.md',
				path: 'cli › README.md',
				title: 'CLI docs',
				body: [
					'copix doctor',
					'copix "summarize this repo"',
					'# No account — local Ollama only',
				],
				tasksDone: 3,
			},
		],
		defaultChoice: 0,
		reply: (choice) =>
			`Default locked to ${choice}. Installers are live for macOS/Linux and Windows; run copix doctor after ollama pull.`,
		followUps: [
			{ kind: 'file', name: 'install.sh', delta: '+12' },
			{ kind: 'file', name: 'README.md', delta: '+28' },
			{ kind: 'status', text: 'Smoke · copix --version ok', done: true },
		],
	},

};

function delay(ms: number, signal: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		if (signal.aborted) {
			reject(new DOMException('aborted', 'AbortError'));
			return;
		}
		const id = window.setTimeout(() => resolve(), ms);
		const onAbort = () => {
			window.clearTimeout(id);
			reject(new DOMException('aborted', 'AbortError'));
		};
		signal.addEventListener('abort', onAbort, { once: true });
	});
}

async function typeIntoLastAgent(
	setItems: Dispatch<SetStateAction<DemoItem[]>>,
	full: string,
	signal: AbortSignal,
) {
	setItems((prev) => [...prev, { kind: 'agent', text: '', streaming: true }]);
	const step = Math.max(1, Math.ceil(full.length / 40));
	for (let i = 0; i <= full.length; i += step) {
		const slice = full.slice(0, Math.min(full.length, i));
		setItems((prev) => {
			const next = prev.slice();
			const last = next[next.length - 1];
			if (last?.kind === 'agent') {
				next[next.length - 1] = {
					kind: 'agent',
					text: slice,
					streaming: i < full.length,
				};
			}
			return next;
		});
		await delay(24, signal);
	}
	setItems((prev) => {
		const next = prev.slice();
		const last = next[next.length - 1];
		if (last?.kind === 'agent') {
			next[next.length - 1] = { kind: 'agent', text: full, streaming: false };
		}
		return next;
	});
}

export function InteractiveDemo() {
	const [sceneId, setSceneId] = useState<SceneId>('studio');
	const scene = scenes[sceneId];
	const [items, setItems] = useState<DemoItem[]>([]);
	const [input, setInput] = useState('');
	const [runId, setRunId] = useState(0);
	const [phase, setPhase] = useState<'playing' | 'awaiting' | 'done'>('playing');
	const [answered, setAnswered] = useState(false);
	const [editor, setEditor] = useState<EditorSnap>(scene.editorSnaps[0]);
	const [panel, setPanel] = useState(1);
	const [building, setBuilding] = useState(false);
	const threadRef = useRef<HTMLDivElement>(null);
	const answeredRef = useRef(false);
	const finishingRef = useRef(false);
	const sceneRef = useRef(scene);
	const abortRef = useRef<AbortController | null>(null);
	const selectedRef = useRef<number | null>(null);
	sceneRef.current = scene;

	useEffect(() => {
		answeredRef.current = answered;
	}, [answered]);

	useEffect(() => {
		const el = threadRef.current;
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
	}, [items, phase]);

	async function completeAnswer(forcedIndex: number | null) {
		if (finishingRef.current || answeredRef.current) return;
		finishingRef.current = true;
		const current = sceneRef.current;
		const signal = abortRef.current?.signal;
		if (!signal || signal.aborted) return;

		const choiceIndex = forcedIndex ?? selectedRef.current ?? current.defaultChoice;
		selectedRef.current = choiceIndex;
		const choice =
			current.script.find((i): i is Question => i.kind === 'question')?.options[choiceIndex] ??
			'your choice';

		setItems((prev) =>
			prev.map((item) =>
				item.kind === 'question' ? { ...item, selected: choiceIndex } : item,
			),
		);
		setAnswered(true);
		answeredRef.current = true;
		setPhase('playing');
		setBuilding(true);

		setItems((prev) => [
			...prev,
			{ kind: 'status', text: 'Updating plan from your choice', done: false },
		]);
		try {
			await delay(420, signal);
			setItems((prev) => {
				const next = prev.slice();
				const last = next[next.length - 1];
				if (last?.kind === 'status') next[next.length - 1] = { ...last, done: true };
				return next;
			});
			await typeIntoLastAgent(setItems, current.reply(choice), signal);
			setItems((prev) => [...prev, ...current.followUps]);
			setEditor(current.editorSnaps[1] ?? current.editorSnaps[0]);
			await delay(650, signal);
			setEditor(current.editorSnaps[2] ?? current.editorSnaps[0]);
			setBuilding(false);
			setPhase('done');
		} catch {
			/* aborted on replay/scene switch */
		}
	}

	useEffect(() => {
		const ac = new AbortController();
		abortRef.current = ac;
		const { signal } = ac;
		const current = scenes[sceneId];

		async function play() {
			setItems([]);
			setAnswered(false);
			answeredRef.current = false;
			finishingRef.current = false;
			selectedRef.current = null;
			setEditor(current.editorSnaps[0]);
			setPanel(1);
			setBuilding(false);
			setPhase('playing');

			for (const step of current.script) {
				if (signal.aborted) return;
				if (step.kind === 'status') {
					setItems((prev) => [...prev, { ...step, done: false }]);
					await delay(400, signal);
					setItems((prev) => {
						const next = prev.slice();
						const last = next[next.length - 1];
						if (last?.kind === 'status') next[next.length - 1] = { ...last, done: true };
						return next;
					});
					await delay(160, signal);
					continue;
				}
				if (step.kind === 'file') {
					setItems((prev) => [...prev, step]);
					await delay(360, signal);
					continue;
				}
				if (step.kind === 'agent') {
					await typeIntoLastAgent(setItems, step.text, signal);
					await delay(220, signal);
					continue;
				}
				if (step.kind === 'question') {
					setItems((prev) => [...prev, { ...step, selected: null }]);
					setPhase('awaiting');
					await delay(4500, signal);
					if (!answeredRef.current && !signal.aborted) {
						await completeAnswer(current.defaultChoice);
					}
					return;
				}
				setItems((prev) => [...prev, step]);
				await delay(320, signal);
			}
		}

		play().catch((err) => {
			if (err instanceof DOMException && err.name === 'AbortError') return;
			console.error(err);
		});

		return () => ac.abort();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [runId, sceneId]);

	function onSubmit(e: FormEvent) {
		e.preventDefault();
		const text = input.trim();
		if (!text) return;
		setInput('');
		setItems((prev) => [
			...prev,
			{ kind: 'user', text },
			{ kind: 'status', text: 'Thinking', done: true },
			{ kind: 'status', text: 'web_search · gathering references', done: true },
			{
				kind: 'agent',
				text: 'Continue in Copix Desktop or the CLI — same agents, local Ollama, no account required.',
			},
		]);
		setPhase('done');
	}

	function switchScene(id: SceneId) {
		if (id === sceneId) {
			setRunId((n) => n + 1);
			return;
		}
		setSceneId(id);
		setRunId((n) => n + 1);
	}

	return (
		<div className="demo demo-studio" aria-label="Copix agent simulation">
			<div className="demo-scene-switch" role="tablist" aria-label="Demo scene">
				{(Object.keys(scenes) as SceneId[]).map((id) => (
					<button
						key={id}
						type="button"
						role="tab"
						aria-selected={sceneId === id}
						className={sceneId === id ? 'active' : ''}
						onClick={() => switchScene(id)}
					>
						{scenes[id].label}
					</button>
				))}
			</div>

			<div className="demo-chrome">
				<span /><span /><span />
				<div className="demo-title">{scene.chrome}</div>
				<div className="demo-chrome-meta">
					{building ? <em className="demo-pulse">Building…</em> : null}
					Grok 4.5 · Plan
				</div>
			</div>

			<div className="demo-mobile-tabs" aria-hidden>
				<button type="button" className={panel === 0 ? 'active' : ''} onClick={() => setPanel(0)}>Agents</button>
				<button type="button" className={panel === 1 ? 'active' : ''} onClick={() => setPanel(1)}>Chat</button>
				<button type="button" className={panel === 2 ? 'active' : ''} onClick={() => setPanel(2)}>Plan</button>
			</div>

			<div className="demo-layout">
				<aside className={`demo-rail ${panel === 0 ? 'show-mobile' : ''}`}>
					<div className="demo-rail-label">Agents</div>
					<ul>
						{scene.history.map((h) => (
							<li key={h.title} className={!h.done ? 'active' : ''}>
								<span
									className={`demo-check ${h.done || (!h.done && phase === 'done') ? 'done' : ''}`}
								/>
								<div>
									<strong>{h.title}</strong>
									<em>{h.when}</em>
								</div>
							</li>
						))}
					</ul>
				</aside>

				<section className={`demo-chat ${panel === 1 ? 'show-mobile' : ''}`}>
					<div className="demo-thread" ref={threadRef}>
						{items.map((item, idx) => {
							if (item.kind === 'status') {
								return (
									<div key={idx} className={`demo-status ${item.done ? 'done' : 'live'}`}>
										<span className="demo-status-dot" aria-hidden />
										{item.text}
										{!item.done ? <span className="demo-ellipsis" aria-hidden /> : null}
									</div>
								);
							}
							if (item.kind === 'file') {
								return (
									<button
										key={idx}
										type="button"
										className="demo-file-pill"
										onClick={() => {
											const snap =
												scene.editorSnaps.find((s) => s.tab === item.name) ||
												scene.editorSnaps[0];
											setEditor(snap);
											setPanel(2);
										}}
									>
										<span className="demo-file-icon" aria-hidden />
										{item.name} <span>{item.delta}</span>
									</button>
								);
							}
							if (item.kind === 'question') {
								return (
									<div key={idx} className="demo-question">
										<div className="demo-question-title">{item.title}</div>
										<p>{item.prompt}</p>
										<ol>
											{item.options.map((opt, oi) => (
												<li key={opt}>
													<button
														type="button"
														className={item.selected === oi ? 'selected' : ''}
														disabled={answered}
														onClick={() => {
															selectedRef.current = oi;
															setItems((prev) =>
																prev.map((row) =>
																	row.kind === 'question'
																		? { ...row, selected: oi }
																		: row,
																),
															);
														}}
													>
														<span>{oi + 1}</span>
														{opt}
													</button>
												</li>
											))}
										</ol>
										{!answered ? (
											<div className="demo-question-actions">
												<button
													type="button"
													className="demo-skip"
													onClick={() => void completeAnswer(scene.defaultChoice)}
												>
													Skip
												</button>
												<button
													type="button"
													className="demo-continue"
													onClick={() => void completeAnswer(null)}
												>
													Continue
												</button>
											</div>
										) : null}
									</div>
								);
							}
							return (
								<div key={idx} className={`demo-line ${item.kind}`}>
									<span className={`demo-tag ${item.kind === 'agent' ? 'agent' : ''}`}>
										{item.kind === 'user' ? 'You' : 'Copix'}
									</span>
									<p>
										{item.text}
										{item.streaming ? <span className="demo-caret" aria-hidden /> : null}
									</p>
								</div>
							);
						})}
					</div>

					<form className="demo-input" onSubmit={onSubmit}>
						<span className="demo-arrow">→</span>
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Add a follow-up…"
							aria-label="Try Copix"
						/>
						<button type="submit">Send</button>
					</form>
					<div className="demo-composer-meta">
						<span className="demo-mode">Plan</span>
						<span className="demo-model">Grok 4.5</span>
						<button type="button" className="demo-replay" onClick={() => setRunId((n) => n + 1)}>
							Replay
						</button>
					</div>
				</section>

				<aside className={`demo-editor ${panel === 2 ? 'show-mobile' : ''}`}>
					<div className="demo-tabs">
						{scene.editorSnaps.map((s) => (
							<button
								key={s.tab}
								type="button"
								className={editor.tab === s.tab ? 'active' : ''}
								onClick={() => setEditor(s)}
							>
								{s.tab}
							</button>
						))}
					</div>
					<div className="demo-editor-bar">
						<span>{editor.path}</span>
						<button type="button" className="demo-build" disabled={building}>
							{building ? 'Building…' : 'Build'}
						</button>
					</div>
					<div className="demo-doc" key={editor.tab}>
						<h3>{editor.title}</h3>
						{editor.body.map((line) => (
							<p key={line} className={/[;{}=]|return |className|\.otp/.test(line) ? 'code' : ''}>
								{line}
							</p>
						))}
					</div>
					<div className="demo-tasks">
						<div className="demo-tasks-head">{scene.tasks.length} Tasks</div>
						<ul>
							{scene.tasks.map((t, i) => (
								<li
									key={t}
									className={
										i < editor.tasksDone
											? 'done'
											: i === editor.tasksDone
												? 'current'
												: ''
									}
								>
									<span />
									{t}
								</li>
							))}
						</ul>
					</div>
				</aside>
			</div>
		</div>
	);
}
