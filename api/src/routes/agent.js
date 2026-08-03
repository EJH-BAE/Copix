import { Hono } from 'hono';
import { streamText } from 'hono/streaming';
import { env } from '../lib/env.js';
import { getChat, listChats, saveChat } from '../lib/store.js';
import { readBearer, verifySession } from '../auth/session.js';

const agent = new Hono();

async function requireUser(c) {
	return verifySession(readBearer(c));
}

agent.get('/chats', async (c) => {
	const user = await requireUser(c);
	if (!user) return c.json({ ok: false, error: 'Unauthorized' }, 401);
	return c.json({ ok: true, chats: listChats(user.id) });
});

agent.post('/chats', async (c) => {
	const user = await requireUser(c);
	if (!user) return c.json({ ok: false, error: 'Unauthorized' }, 401);
	const body = await c.req.json().catch(() => ({}));
	const session = {
		id: `chat_${Date.now().toString(36)}`,
		title: body.title || 'New chat',
		createdAt: Date.now(),
		updatedAt: Date.now(),
		messages: [],
	};
	saveChat(user.id, session);
	return c.json({ ok: true, chat: session });
});

/** Non-streaming fallback. */
agent.post('/chats/:id/message', async (c) => {
	const user = await requireUser(c);
	if (!user) return c.json({ ok: false, error: 'Unauthorized' }, 401);
	const id = c.req.param('id');
	const chat = getChat(user.id, id);
	if (!chat) return c.json({ ok: false, error: 'Chat not found' }, 404);

	const body = await c.req.json().catch(() => ({}));
	const content = String(body.content || '').trim();
	if (!content) return c.json({ ok: false, error: 'Empty message' }, 400);

	chat.messages.push({ role: 'user', content, timestamp: Date.now() });
	if (chat.messages.filter(m => m.role === 'user').length === 1) {
		chat.title = content.length > 42 ? `${content.slice(0, 42)}…` : content;
	}

	const ollamaUrl = String(body.ollamaBaseUrl || env.ollamaBaseUrl).replace(/\/$/, '');
	const model = String(body.model || 'qwen2.5:3b');
	let assistant = '';
	try {
		const res = await fetch(`${ollamaUrl}/api/chat`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model,
				stream: false,
				messages: [
					{
						role: 'system',
						content: 'You are Copix, a coding agent in Copix Web. Be concise, practical, and accurate.',
					},
					...chat.messages.map(m => ({ role: m.role, content: m.content })),
				],
			}),
			signal: AbortSignal.timeout(120_000),
		});
		if (!res.ok) {
			assistant = `Could not reach the model at ${ollamaUrl} (${res.status}). Start Ollama or set OLLAMA_BASE_URL.`;
		} else {
			const data = await res.json();
			assistant = data.message?.content || data.response || '(empty reply)';
		}
	} catch (err) {
		assistant = `Model request failed: ${err instanceof Error ? err.message : String(err)}`;
	}

	chat.messages.push({ role: 'assistant', content: assistant, timestamp: Date.now() });
	chat.updatedAt = Date.now();
	saveChat(user.id, chat);
	return c.json({ ok: true, chat, reply: assistant });
});

/** SSE streaming chat — preferred by Copix Web. */
agent.post('/chats/:id/stream', async (c) => {
	const user = await requireUser(c);
	if (!user) return c.json({ ok: false, error: 'Unauthorized' }, 401);
	const id = c.req.param('id');
	const chat = getChat(user.id, id);
	if (!chat) return c.json({ ok: false, error: 'Chat not found' }, 404);

	const body = await c.req.json().catch(() => ({}));
	const content = String(body.content || '').trim();
	if (!content) return c.json({ ok: false, error: 'Empty message' }, 400);

	chat.messages.push({ role: 'user', content, timestamp: Date.now() });
	if (chat.messages.filter(m => m.role === 'user').length === 1) {
		chat.title = content.length > 42 ? `${content.slice(0, 42)}…` : content;
	}

	const ollamaUrl = String(body.ollamaBaseUrl || env.ollamaBaseUrl).replace(/\/$/, '');
	const model = String(body.model || 'qwen2.5:3b');

	c.header('Content-Type', 'text/event-stream; charset=utf-8');
	c.header('Cache-Control', 'no-cache');
	c.header('Connection', 'keep-alive');

	return streamText(c, async (stream) => {
		const send = async (event, data) => {
			await stream.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
		};

		await send('status', { message: `${model}…` });
		let assistant = '';

		try {
			const res = await fetch(`${ollamaUrl}/api/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					model,
					stream: true,
					messages: [
						{
							role: 'system',
							content: 'You are Copix, a coding agent in Copix Web. Be concise, practical, and accurate.',
						},
						...chat.messages.map(m => ({ role: m.role, content: m.content })),
					],
				}),
				signal: AbortSignal.timeout(180_000),
			});

			if (!res.ok || !res.body) {
				const errText = await res.text().catch(() => '');
				assistant = `Could not reach the model at ${ollamaUrl} (${res.status}). ${errText.slice(0, 160)}`
					+ '\n\nStart Ollama (`ollama serve`) or set OLLAMA_BASE_URL on the API.';
				await send('delta', { text: assistant });
			} else {
				const reader = res.body.getReader();
				const decoder = new TextDecoder();
				let buf = '';
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buf += decoder.decode(value, { stream: true });
					const lines = buf.split('\n');
					buf = lines.pop() || '';
					for (const line of lines) {
						const t = line.trim();
						if (!t) continue;
						try {
							const json = JSON.parse(t);
							const piece = json.message?.content || json.response || '';
							if (piece) {
								assistant += piece;
								await send('delta', { text: piece });
							}
							if (json.done) await send('status', { message: '' });
						} catch { /* partial json */ }
					}
				}
			}
		} catch (err) {
			assistant = `Model request failed: ${err instanceof Error ? err.message : String(err)}`
				+ '\n\nStart Ollama or point the API at a reachable host.';
			await send('delta', { text: assistant });
		}

		if (!assistant) {
			assistant = '(empty reply)';
			await send('delta', { text: assistant });
		}

		chat.messages.push({ role: 'assistant', content: assistant, timestamp: Date.now() });
		chat.updatedAt = Date.now();
		saveChat(user.id, chat);
		await send('done', { chat, reply: assistant });
	});
});

export default agent;
