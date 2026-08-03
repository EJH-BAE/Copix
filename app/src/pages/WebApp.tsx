import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
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
	const [model, setModel] = useState('qwen2.5:3b');
	const [error, setError] = useState('');

	const active = chats.find((c) => c.id === activeId) || null;

	async function refreshChats() {
		if (!token) return;
		const data = await apiFetch<{ chats: Chat[] }>('/agent/chats', { token });
		setChats(data.chats || []);
		if (!activeId && data.chats?.[0]) setActiveId(data.chats[0].id);
	}

	useEffect(() => {
		if (token) refreshChats().catch((e) => setError(String(e.message || e)));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

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
		if (!text) return;
		setBusy(true);
		setError('');
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
			const data = await apiFetch<{ chat: Chat }>('/agent/chats/' + id + '/message', {
				method: 'POST',
				token,
				body: JSON.stringify({ content: text, model }),
			});
			setChats((prev) => prev.map((c) => (c.id === data.chat.id ? data.chat : c)));
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
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
					<button type="button" className="btn primary" onClick={newChat} disabled={busy}>
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
					</div>
					<select value={model} onChange={(e) => setModel(e.target.value)} aria-label="Model">
						<option value="qwen2.5:3b">qwen2.5:3b</option>
						<option value="qwen2.5-coder:7b">qwen2.5-coder:7b</option>
						<option value="mistral:7b">mistral:7b</option>
						<option value="qwen3.5:4b">qwen3.5:4b</option>
					</select>
				</header>

				<div className="webapp-thread">
					{!active?.messages?.length && (
						<div className="webapp-empty">
							<h1>You’re in Copix Web</h1>
							<p>Signed-in sessions can talk to your Ollama models through the Copix API. Ask anything to start.</p>
						</div>
					)}
					{active?.messages?.map((m, i) => (
						<div key={i} className={`webapp-msg ${m.role}`}>
							<div className="webapp-msg-label">{m.role === 'user' ? 'You' : 'Copix'}</div>
							<pre>{m.content}</pre>
						</div>
					))}
				</div>

				{error && <p className="webapp-error">{error}</p>}

				<form className="webapp-composer" onSubmit={send}>
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
