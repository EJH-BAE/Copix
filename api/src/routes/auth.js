import { Hono } from 'hono';
import { env, oauthProviders } from '../lib/env.js';
import {
	consume2faChallenge,
	create2faChallenge,
	findUserByEmail,
	getUser,
	getUserRecord,
	peekOtp,
	publicUser,
	saveOtp,
	upsertUser,
	verifyOtp,
} from '../lib/store.js';
import { hashPassword, validatePassword, verifyPassword } from '../lib/password.js';
import { sendOtpEmail } from '../email/send.js';
import { readBearer, signSession, verifySession } from '../auth/session.js';
import {
	appleAuthUrl, appleExchange,
	githubAuthUrl, githubExchange,
	googleAuthUrl, googleExchange,
} from '../auth/oauth.js';

const auth = new Hono();
const pendingStates = new Map();

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

auth.get('/providers', (c) => c.json({
	...oauthProviders(),
	password: true,
	twoFactor: true,
}));

/** Sign up with email + password → sends 6-digit 2FA code. */
auth.post('/signup', async (c) => {
	const body = await c.req.json().catch(() => ({}));
	const email = String(body.email || '').trim().toLowerCase();
	const password = String(body.password || '');
	const name = String(body.name || '').trim();

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return c.json({ ok: false, error: 'Enter a valid email address' }, 400);
	}
	const pwErr = validatePassword(password);
	if (pwErr) return c.json({ ok: false, error: pwErr }, 400);
	if (findUserByEmail(email)) {
		return c.json({ ok: false, error: 'An account with this email already exists — sign in instead' }, 409);
	}

	const passwordHash = await hashPassword(password);
	const code = makeCode();
	saveOtp(email, code, {
		purpose: 'signup',
		pending: { email, passwordHash, name: name || email.split('@')[0] },
	});
	const sent = await sendOtpEmail(email, code);
	return c.json({
		ok: true,
		step: '2fa',
		email,
		demo: Boolean(sent.demo),
		demoCode: sent.demo ? code : undefined,
		message: sent.demo
			? 'Dev mode: enter the 6-digit code shown below to finish signup.'
			: 'Enter the 6-digit code we emailed you to finish creating your account.',
	});
});

/** Complete signup after 2FA code. */
auth.post('/signup/verify', async (c) => {
	const body = await c.req.json().catch(() => ({}));
	const email = String(body.email || '').trim().toLowerCase();
	const code = String(body.code || '').trim();
	if (!email || !/^\d{6}$/.test(code)) {
		return c.json({ ok: false, error: 'Enter the 6-digit code from your email' }, 400);
	}
	const check = verifyOtp(email, code, 'signup');
	if (!check.ok) return c.json({ ok: false, error: check.error }, 400);
	const pending = check.pending;
	if (!pending?.passwordHash) return c.json({ ok: false, error: 'Signup expired — start again' }, 400);

	const user = upsertUser({
		email: pending.email,
		name: pending.name,
		passwordHash: pending.passwordHash,
		provider: 'email',
		subject: pending.email,
	});
	const token = await signSession(user.id);
	return c.json({ ok: true, token, user: publicUser(user) });
});

/** Sign in with email + password → always challenges with 6-digit 2FA. */
auth.post('/login', async (c) => {
	const body = await c.req.json().catch(() => ({}));
	const email = String(body.email || '').trim().toLowerCase();
	const password = String(body.password || '');
	const user = findUserByEmail(email);
	if (!user?.passwordHash) {
		return c.json({ ok: false, error: 'Invalid email or password' }, 401);
	}
	const ok = await verifyPassword(password, user.passwordHash);
	if (!ok) return c.json({ ok: false, error: 'Invalid email or password' }, 401);

	const code = makeCode();
	const challengeId = create2faChallenge(user.id);
	saveOtp(email, code, { purpose: '2fa', pending: { challengeId } });
	const sent = await sendOtpEmail(email, code);
	return c.json({
		ok: true,
		step: '2fa',
		email,
		challengeId,
		demo: Boolean(sent.demo),
		demoCode: sent.demo ? code : undefined,
		message: sent.demo
			? 'Password OK — enter the 6-digit 2FA code shown below.'
			: 'Password OK — enter the 6-digit code we emailed you.',
	});
});

/** Complete login 2FA. */
auth.post('/login/verify', async (c) => {
	const body = await c.req.json().catch(() => ({}));
	const email = String(body.email || '').trim().toLowerCase();
	const code = String(body.code || '').trim();
	const challengeId = String(body.challengeId || '');
	if (!email || !/^\d{6}$/.test(code)) {
		return c.json({ ok: false, error: 'Enter the 6-digit code from your email' }, 400);
	}
	const check = verifyOtp(email, code, '2fa');
	if (!check.ok) return c.json({ ok: false, error: check.error }, 400);
	const userId = consume2faChallenge(challengeId || check.pending?.challengeId);
	if (!userId) return c.json({ ok: false, error: 'Login challenge expired — sign in again' }, 400);
	const user = getUserRecord(userId);
	if (!user) return c.json({ ok: false, error: 'Account not found' }, 404);
	const token = await signSession(user.id);
	return c.json({ ok: true, token, user: publicUser(user) });
});

/** Resend 2FA / signup verification code. */
auth.post('/2fa/resend', async (c) => {
	const body = await c.req.json().catch(() => ({}));
	const email = String(body.email || '').trim().toLowerCase();
	const purpose = body.purpose === 'signup' ? 'signup' : '2fa';
	const existing = findUserByEmail(email);
	const prior = peekOtp(email);
	const code = makeCode();

	if (purpose === 'signup') {
		const pending = prior?.purpose === 'signup' ? prior.pending : null;
		if (!pending?.passwordHash) {
			return c.json({ ok: false, error: 'Restart signup to get a new code' }, 400);
		}
		saveOtp(email, code, { purpose: 'signup', pending });
		const sent = await sendOtpEmail(email, code);
		return c.json({
			ok: true,
			step: '2fa',
			email,
			demo: Boolean(sent.demo),
			demoCode: sent.demo ? code : undefined,
			message: sent.demo ? 'New signup code (dev preview below).' : 'New signup code sent.',
		});
	}

	if (!existing) {
		return c.json({ ok: false, error: 'No account for this email' }, 404);
	}
	const challengeId = create2faChallenge(existing.id);
	saveOtp(email, code, { purpose: '2fa', pending: { challengeId } });
	const sent = await sendOtpEmail(email, code);
	return c.json({
		ok: true,
		step: '2fa',
		email,
		challengeId,
		demo: Boolean(sent.demo),
		demoCode: sent.demo ? code : undefined,
		message: sent.demo ? 'New 2FA code (dev preview below).' : 'New 2FA code sent.',
	});
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
		return finishOAuth(c, await googleExchange(code), state);
	} catch (err) {
		return c.text(String(err?.message || err), 400);
	}
});

auth.get('/callback/github', async (c) => {
	try {
		const code = c.req.query('code');
		const state = c.req.query('state');
		if (!code) return c.text('Missing code', 400);
		return finishOAuth(c, await githubExchange(code), state);
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
		return finishOAuth(c, await appleExchange(code), state);
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
