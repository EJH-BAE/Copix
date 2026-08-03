import { FormEvent, useEffect, useState } from 'react';

type StatusLine = { kind: 'status'; text: string };
type FilePill = { kind: 'file'; name: string; delta: string };
type Bubble = { kind: 'user' | 'agent'; text: string };
type Question = {
	kind: 'question';
	title: string;
	prompt: string;
	options: string[];
	selected: number | null;
};
type DemoItem = StatusLine | FilePill | Bubble | Question;

const history = [
	{ title: 'Landing page creation', when: '2h', done: true },
	{ title: 'Mission Control Plan', when: 'Now', done: false },
	{ title: 'PyTorch MNIST Experiment', when: '1d', done: true },
	{ title: 'Bioinformatics Tools', when: '3d', done: true },
];

const tasks = [
	'Add expose modes to useAppStore.ts',
	'Create MissionControlView.tsx',
	'Update AppManager.tsx for triggers',
];

const script: DemoItem[] = [
	{ kind: 'user', text: 'Plan a Mission Control interface for macOS Studio' },
	{ kind: 'status', text: 'Thinking for 2s' },
	{ kind: 'status', text: 'Reading AppManager.tsx' },
	{ kind: 'status', text: 'Searched for expose patterns' },
	{ kind: 'file', name: 'feature-prd.md', delta: '+68' },
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
];

export function InteractiveDemo() {
	const [items, setItems] = useState<DemoItem[]>([]);
	const [input, setInput] = useState('');
	const [playing, setPlaying] = useState(true);
	const [answered, setAnswered] = useState(false);
	const [activeTask, setActiveTask] = useState(0);

	useEffect(() => {
		if (!playing) return;
		setItems([]);
		setAnswered(false);
		setActiveTask(0);
		let i = 0;
		const id = window.setInterval(() => {
			i += 1;
			setItems(script.slice(0, i));
			if (i >= script.length) {
				window.clearInterval(id);
				setPlaying(false);
			}
		}, 520);
		return () => window.clearInterval(id);
	}, [playing]);

	function chooseOption(index: number) {
		setItems((prev) =>
			prev.map((item) =>
				item.kind === 'question' ? { ...item, selected: index } : item,
			),
		);
	}

	function continueAfterQuestion() {
		const q = items.find((i): i is Question => i.kind === 'question');
		const choice = q && q.selected != null ? q.options[q.selected] : 'Both keyboard and menu button';
		setAnswered(true);
		setActiveTask(1);
		setItems((prev) => [
			...prev,
			{ kind: 'status', text: 'Updating plan from your choice' },
			{
				kind: 'agent',
				text: `Got it — trigger via ${choice}. I’ll wire MenuBar + F3 and keep the grid overview in MissionControlView.`,
			},
			{ kind: 'file', name: 'AppManager.tsx', delta: '+24' },
			{ kind: 'file', name: 'MissionControlView.tsx', delta: '+112' },
		]);
	}

	function onSubmit(e: FormEvent) {
		e.preventDefault();
		const text = input.trim();
		if (!text) return;
		setInput('');
		setItems((prev) => [
			...prev,
			{ kind: 'user', text },
			{ kind: 'status', text: 'Thinking for 1s' },
			{ kind: 'status', text: 'web_search · gathering references' },
			{
				kind: 'agent',
				text: 'Sign in, then continue in Copix Desktop or the CLI with your account.',
			},
		]);
	}

	return (
		<div className="demo demo-studio" aria-label="Copix agent simulation">
			<div className="demo-chrome">
				<span /><span /><span />
				<div className="demo-title">Copix Desktop</div>
				<div className="demo-chrome-meta">Grok 4.5 · Plan</div>
			</div>

			<div className="demo-layout">
				<aside className="demo-rail">
					<div className="demo-rail-label">Agents</div>
					<ul>
						{history.map((h) => (
							<li key={h.title} className={!h.done ? 'active' : ''}>
								<span className={`demo-check ${h.done ? 'done' : ''}`} />
								<div>
									<strong>{h.title}</strong>
									<em>{h.when}</em>
								</div>
							</li>
						))}
					</ul>
				</aside>

				<section className="demo-chat">
					<div className="demo-thread">
						{items.map((item, idx) => {
							if (item.kind === 'status') {
								return (
									<div key={idx} className="demo-status">
										{item.text}
									</div>
								);
							}
							if (item.kind === 'file') {
								return (
									<div key={idx} className="demo-file-pill">
										{item.name} <span>{item.delta}</span>
									</div>
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
														onClick={() => chooseOption(oi)}
													>
														<span>{oi + 1}</span>
														{opt}
													</button>
												</li>
											))}
										</ol>
										{!answered ? (
											<div className="demo-question-actions">
												<button type="button" className="demo-skip" onClick={() => { setAnswered(true); }}>
													Skip
												</button>
												<button
													type="button"
													className="demo-continue"
													onClick={continueAfterQuestion}
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
									<p>{item.text}</p>
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
						<button type="button" className="demo-replay" onClick={() => setPlaying(true)}>
							Replay
						</button>
					</div>
				</section>

				<aside className="demo-editor">
					<div className="demo-tabs">
						<span className="active">feature-prd.md</span>
						<span>presence.ts</span>
					</div>
					<div className="demo-editor-bar">
						<span>Plans › feature-prd.md</span>
						<button type="button" className="demo-build">Build</button>
					</div>
					<div className="demo-doc">
						<h3>Mission Control Interface</h3>
						<p>Grid view of open windows with MenuBar and F3 triggers.</p>
						<p className="muted">View behavior mirrors expose-style overview in Studio.</p>
					</div>
					<div className="demo-tasks">
						<div className="demo-tasks-head">{tasks.length} Tasks</div>
						<ul>
							{tasks.map((t, i) => (
								<li key={t} className={i < activeTask ? 'done' : i === activeTask ? 'current' : ''}>
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
