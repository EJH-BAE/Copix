import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiFetch, apiStream } from '../lib/api';
import { useAuth } from '../lib/auth';

type Msg = { role: 'user' | 'assistant'; content: string; timestamp: number };
type Chat = {
	id: string;
	title: string;
	messages: Msg[];
	updatedAt: number;
};

export default function WebApp() {
	const { user, token, loading, logout } = useAuth();
	const [chats, setChats] = useState<Chat[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [input, setInput] = useState('');
	const [busy, setBusy] = useState(false);
	const [status, setStatus] = useState('');
	const [model, setModel] = useState('qwen2.5:3b');
	const [error, setError] = useState('');
	const threadRef = useRef<HTMLDivElement | null>(null);

	const active = chats.find((c) => c.id === activeId) || null;

	async function refreshChats() {
		if (!token) return;
		const data = await apiFetch<{ chats: Chat[] }>('/agent/chats', { token });
		setChats(data.chats || []);
		if (!activeId && data.chats?.[0]) setActiveId(data.chats[0].id);
	}

	useEffect(() => {
		document.title = 'Copix Web';
	}, []);

	useEffect(() => {
		if (token) refreshChats().catch((e) => setError(String(e.message || e)));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

	useEffect(() => {
		const el = threadRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [active?.messages, status, busy]);

	if (loading) {
		return <div className="webapp-boot">Loading Copix…</div>;
	}
	if (!user || !token) {
		return <Navigate to="/login" replace />;
	}

	async function newChat() {
		setBusy(true);
		setError('');
		try {
			const data = await apiFetch<{ chat: Chat }>('/agent/chats', {
				method: 'POST',
				token,
				body: JSON.stringify({ title: 'New chat' }),
			});
			setChats((prev) => [data.chat, ...prev]);
			setActiveId(data.chat.id);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	}

	async function send(e: FormEvent) {
		e.preventDefault();
		const text = input.trim();
		if (!text || busy) return;
		setBusy(true);
		setError('');
		setStatus('Starting…');
		setInput('');

		try {
			let id = activeId;
			if (!id) {
				const created = await apiFetch<{ chat: Chat }>('/agent/chats', {
					method: 'POST',
					token,
					body: JSON.stringify({ title: 'New chat' }),
				});
				id = created.chat.id;
				setChats((prev) => [created.chat, ...prev]);
				setActiveId(id);
			}

			const userMsg: Msg = { role: 'user', content: text, timestamp: Date.now() };
			const assistantMsg: Msg = { role: 'assistant', content: '', timestamp: Date.now() };
			setChats((prev) =>
				prev.map((c) =>
					c.id === id
						? {
								...c,
								title:
									c.messages.filter((m) => m.role === 'user').length === 0
										? text.length > 42
											? `${text.slice(0, 42)}…`
											: text
										: c.title,
								messages: [...c.messages, userMsg, assistantMsg],
								updatedAt: Date.now(),
							}
						: c,
				),
			);

			await apiStream(
				`/agent/chats/${id}/stream`,
				{
					method: 'POST',
					token,
					body: JSON.stringify({ content: text, model }),
				},
				{
					onStatus: (message) => setStatus(message),
					onDelta: (piece) => {
						setChats((prev) =>
							prev.map((c) => {
								if (c.id !== id) return c;
								const messages = [...c.messages];
								const last = messages[messages.length - 1];
								if (last?.role === 'assistant') {
									messages[messages.length - 1] = {
										...last,
										content: last.content + piece,
									};
								}
								return { ...c, messages, updatedAt: Date.now() };
							}),
						);
					},
					onDone: (payload) => {
						const data = payload as { chat?: Chat };
						if (data.chat) {
							setChats((prev) => prev.map((c) => (c.id === data.chat!.id ? data.chat! : c)));
						}
						setStatus('');
					},
					onError: (message) => setError(message),
				},
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
			setStatus('');
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="webapp">
			<aside className="webapp-side">
				<div className="webapp-side-top">
					<Link to="/" className="webapp-brand">
						<img src={`${import.meta.env.BASE_URL}icon.png`} alt="" width={22} height={22} />
						Copix Web
					</Link>
					<button type="button" className="btn primary" onClick={() => void newChat()} disabled={busy}>
						New agent
					</button>
				</div>
				<ul className="webapp-chats">
					{chats.map((c) => (
						<li key={c.id}>
							<button
								type="button"
								className={c.id === activeId ? 'active' : ''}
								onClick={() => setActiveId(c.id)}
							>
								{c.title || 'Untitled'}
							</button>
						</li>
					))}
				</ul>
				<div className="webapp-user">
					<div>
						<strong>{user.name}</strong>
						<span>{user.email}</span>
					</div>
					<button type="button" className="btn ghost" onClick={logout}>Sign out</button>
				</div>
			</aside>

			<main className="webapp-main">
				<header className="webapp-bar">
					<div>
						<span className="dot" /> Agent
						<span className="muted"> · ollama/{model}</span>
						{status ? <span className="webapp-status"> · {status}</span> : null}
						{busy && !status ? <span className="webapp-status"> · streaming…</span> : null}
					</div>
					<select value={model} onChange={(e) => setModel(e.target.value)} aria-label="Model">
						<option value="qwen2.5:3b">qwen2.5:3b</option>
						<option value="qwen2.5-coder:7b">qwen2.5-coder:7b</option>
						<option value="mistral:7b">mistral:7b</option>
						<option value="qwen3.5:4b">qwen3.5:4b</option>
					</select>
				</header>

				<div className="webapp-thread" ref={threadRef}>
					{!active?.messages?.length && (
						<div className="webapp-empty">
							<h1>You’re in Copix Web</h1>
							<p>Signed-in sessions stream from your Ollama models through the Copix API. Ask anything to start.</p>
							<p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
								Try: “Plan a Mission Control view” · “Explain this error” · “Scaffold a landing page”
							</p>
						</div>
					)}
					{active?.messages?.map((m, i) => {
						const streaming = busy && m.role === 'assistant' && i === active.messages.length - 1;
						return (
							<div key={i} className={`webapp-msg ${m.role}`}>
								<div className="webapp-msg-label">{m.role === 'user' ? 'You' : 'Copix'}</div>
								<pre>
									{m.content}
									{streaming ? <span className="webapp-caret">|</span> : null}
								</pre>
							</div>
						);
					})}
				</div>

				{error ? <p className="webapp-error">{error}</p> : null}

				<form className="webapp-composer" onSubmit={(e) => void send(e)}>
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Ask, plan, build anything"
						disabled={busy}
					/>
					<button className="btn primary" type="submit" disabled={busy || !input.trim()}>
						{busy ? '…' : 'Send'}
					</button>
				</form>
			</main>
		</div>
	);
}
