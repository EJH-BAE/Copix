import { Hono } from 'hono';
import { env } from '../lib/env.js';
import { getChat, listChats, saveChat } from '../lib/store.js';
import { readBearer, verifySession } from '../auth/session.js';

const agent = new Hono();

async function requireUser(c) {
	const user = await verifySession(readBearer(c));
	if (!user) return null;
	return user;
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
						content:
							'You are Copix, a coding agent running in the Copix web app. Be concise, practical, and accurate. The user is logged in.',
					},
					...chat.messages.map(m => ({ role: m.role, content: m.content })),
				],
			}),
			signal: AbortSignal.timeout(120_000),
		});
		if (!res.ok) {
			const errText = await res.text().catch(() => '');
			assistant = `Could not reach the model at ${ollamaUrl} (${res.status}). ${errText.slice(0, 200)}`
				+ '\n\nTip: run Ollama locally and set the web app model endpoint, or deploy the API with OLLAMA_BASE_URL.';
		} else {
			const data = await res.json();
			assistant = data.message?.content || data.response || '(empty reply)';
		}
	} catch (err) {
		assistant = `Model request failed: ${err instanceof Error ? err.message : String(err)}`
			+ '\n\nStart Ollama (`ollama serve`) or point the API at a reachable host.';
	}

	chat.messages.push({ role: 'assistant', content: assistant, timestamp: Date.now() });
	chat.updatedAt = Date.now();
	saveChat(user.id, chat);
	return c.json({ ok: true, chat, reply: assistant });
});

export default agent;
