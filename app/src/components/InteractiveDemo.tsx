import { FormEvent, useEffect, useState } from 'react';

const scripted = [
	{ role: 'user' as const, text: 'Scaffold a landing page for an ice cream shop in ~/sites' },
	{ role: 'agent' as const, text: '⬢ Analyzed request · local model' },
	{ role: 'agent' as const, text: '⬢ create_project · ice-cream-marketing-site' },
	{ role: 'agent' as const, text: '⬢ write_file · index.html' },
	{ role: 'agent' as const, text: 'Created ice-cream-marketing-site with hero, flavors, and a signup CTA.' },
];

export function InteractiveDemo() {
	const [lines, setLines] = useState<typeof scripted>([]);
	const [input, setInput] = useState('');
	const [playing, setPlaying] = useState(true);

	useEffect(() => {
		if (!playing) return;
		setLines([]);
		let i = 0;
		const id = window.setInterval(() => {
			i += 1;
			setLines(scripted.slice(0, i));
			if (i >= scripted.length) {
				window.clearInterval(id);
				setPlaying(false);
			}
		}, 700);
		return () => window.clearInterval(id);
	}, [playing]);

	function onSubmit(e: FormEvent) {
		e.preventDefault();
		const text = input.trim();
		if (!text) return;
		setInput('');
		setLines((prev) => [
			...prev,
			{ role: 'user', text },
			{ role: 'agent', text: '⬢ web_search · gathering references' },
			{ role: 'agent', text: `Got it — in the full web app (sign in) Copix runs this for real against your model.` },
		]);
	}

	return (
		<div className="demo">
			<div className="demo-chrome">
				<span /><span /><span />
				<div className="demo-title">Copix Agent</div>
			</div>
			<div className="demo-body">
				{lines.map((l, idx) => (
					<div key={idx} className={`demo-line ${l.role}`}>
						{l.role === 'user' ? <span className="demo-tag">You</span> : <span className="demo-tag agent">Copix</span>}
						<p>{l.text}</p>
					</div>
				))}
			</div>
			<form className="demo-input" onSubmit={onSubmit}>
				<span className="demo-arrow">→</span>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask, plan, build anything"
					aria-label="Try Copix"
				/>
				<button type="submit">Send</button>
			</form>
			<button type="button" className="demo-replay" onClick={() => setPlaying(true)}>
				Replay demo
			</button>
		</div>
	);
}
