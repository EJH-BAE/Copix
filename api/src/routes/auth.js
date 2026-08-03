import { Hono } from 'hono';
import { env, oauthProviders } from '../lib/env.js';
import { saveOtp, upsertUser, verifyOtp } from '../lib/store.js';
import { sendOtpEmail } from '../email/send.js';
import { readBearer, signSession, verifySession } from '../auth/session.js';
import {
	appleAuthUrl, appleExchange,
	githubAuthUrl, githubExchange,
	googleAuthUrl, googleExchange,
} from '../auth/oauth.js';

const auth = new Hono();
const pendingStates = new Map(); // state -> { createdAt, next }

function makeCode() {
	return String(Math.floor(100000 + Math.random() * 900000));
}

function makeState(next = '/') {
	const state = crypto.randomUUID();
	pendingStates.set(state, { createdAt: Date.now(), next });
	return state;
}

function consumeState(state) {
	const row = pendingStates.get(state);
	pendingStates.delete(state);
	if (!row || Date.now() - row.createdAt > 15 * 60 * 1000) return null;
	return row;
}

auth.get('/providers', (c) => c.json(oauthProviders()));

auth.post('/email/start', async (c) => {
	const body = await c.req.json().catch(() => ({}));
	const email = String(body.email || '').trim().toLowerCase();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return c.json({ ok: false, error: 'Enter a valid email address' }, 400);
	}
	const code = makeCode();
	saveOtp(email, code);
	const sent = await sendOtpEmail(email, code);
	return c.json({
		ok: true,
		email,
		demo: Boolean(sent.demo),
		// Only returned when SMTP is not configured (local/dev).
		demoCode: sent.demo ? code : undefined,
		message: sent.demo
			? 'Dev mode: code shown below (configure SMTP to send real email).'
			: 'Check your inbox for a 6-digit Copix code.',
	});
});

auth.post('/email/verify', async (c) => {
	const body = await c.req.json().catch(() => ({}));
	const email = String(body.email || '').trim().toLowerCase();
	const code = String(body.code || '').trim();
	if (!email || !/^\d{6}$/.test(code)) {
		return c.json({ ok: false, error: 'Enter the 6-digit code from your email' }, 400);
	}
	const check = verifyOtp(email, code);
	if (!check.ok) return c.json({ ok: false, error: check.error }, 400);
	const user = upsertUser({ email, name: email.split('@')[0], provider: 'email', subject: email });
	const token = await signSession(user.id);
	return c.json({ ok: true, token, user });
});

auth.get('/oauth/:provider', async (c) => {
	const provider = c.req.param('provider');
	const next = c.req.query('next') || '/app';
	const providers = oauthProviders();
	if (!providers[provider]) {
		return c.json({ ok: false, error: `${provider} login is not configured` }, 400);
	}
	const state = makeState(next);
	let url = '';
	if (provider === 'google') url = googleAuthUrl(state);
	if (provider === 'github') url = githubAuthUrl(state);
	if (provider === 'apple') url = await appleAuthUrl(state);
	return c.redirect(url);
});

async function finishOAuth(c, profile, state) {
	const st = consumeState(state);
	const next = st?.next || '/app';
	const user = upsertUser(profile);
	const token = await signSession(user.id);
	const dest = new URL(`${env.appUrl}/auth/callback`);
	dest.searchParams.set('token', token);
	dest.searchParams.set('next', next);
	return c.redirect(dest.toString());
}

auth.get('/callback/google', async (c) => {
	try {
		const code = c.req.query('code');
		const state = c.req.query('state');
		if (!code) return c.text('Missing code', 400);
		const profile = await googleExchange(code);
		return finishOAuth(c, profile, state);
	} catch (err) {
		return c.text(String(err?.message || err), 400);
	}
});

auth.get('/callback/github', async (c) => {
	try {
		const code = c.req.query('code');
		const state = c.req.query('state');
		if (!code) return c.text('Missing code', 400);
		const profile = await githubExchange(code);
		return finishOAuth(c, profile, state);
	} catch (err) {
		return c.text(String(err?.message || err), 400);
	}
});

auth.post('/callback/apple', async (c) => {
	try {
		const body = await c.req.parseBody();
		const code = String(body.code || '');
		const state = String(body.state || '');
		if (!code) return c.text('Missing code', 400);
		const profile = await appleExchange(code);
		return finishOAuth(c, profile, state);
	} catch (err) {
		return c.text(String(err?.message || err), 400);
	}
});

auth.get('/me', async (c) => {
	const user = await verifySession(readBearer(c));
	if (!user) return c.json({ ok: false, error: 'Unauthorized' }, 401);
	return c.json({ ok: true, user });
});

export default auth;
