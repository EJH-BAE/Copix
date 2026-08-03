import { SignJWT, importPKCS8 } from 'jose';
import { env } from '../lib/env.js';

export function googleAuthUrl(state) {
	const u = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	u.searchParams.set('client_id', env.google.id);
	u.searchParams.set('redirect_uri', `${env.apiPublicUrl}/auth/callback/google`);
	u.searchParams.set('response_type', 'code');
	u.searchParams.set('scope', 'openid email profile');
	u.searchParams.set('state', state);
	u.searchParams.set('access_type', 'online');
	u.searchParams.set('prompt', 'select_account');
	return u.toString();
}

export async function googleExchange(code) {
	const body = new URLSearchParams({
		code,
		client_id: env.google.id,
		client_secret: env.google.secret,
		redirect_uri: `${env.apiPublicUrl}/auth/callback/google`,
		grant_type: 'authorization_code',
	});
	const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body,
	});
	if (!tokenRes.ok) throw new Error(`Google token exchange failed (${tokenRes.status})`);
	const tokens = await tokenRes.json();
	const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
		headers: { Authorization: `Bearer ${tokens.access_token}` },
	});
	if (!profileRes.ok) throw new Error('Google profile fetch failed');
	const p = await profileRes.json();
	return {
		provider: 'google',
		subject: p.sub,
		email: p.email,
		name: p.name,
		avatarUrl: p.picture,
	};
}

export function githubAuthUrl(state) {
	const u = new URL('https://github.com/login/oauth/authorize');
	u.searchParams.set('client_id', env.github.id);
	u.searchParams.set('redirect_uri', `${env.apiPublicUrl}/auth/callback/github`);
	u.searchParams.set('scope', 'read:user user:email');
	u.searchParams.set('state', state);
	return u.toString();
}

export async function githubExchange(code) {
	const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		body: JSON.stringify({
			client_id: env.github.id,
			client_secret: env.github.secret,
			code,
			redirect_uri: `${env.apiPublicUrl}/auth/callback/github`,
		}),
	});
	if (!tokenRes.ok) throw new Error(`GitHub token exchange failed (${tokenRes.status})`);
	const tokens = await tokenRes.json();
	if (tokens.error) throw new Error(tokens.error_description || tokens.error);

	const profileRes = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${tokens.access_token}`,
			Accept: 'application/vnd.github+json',
			'User-Agent': 'CopixAuth',
		},
	});
	if (!profileRes.ok) throw new Error('GitHub profile fetch failed');
	const p = await profileRes.json();

	let email = p.email;
	if (!email) {
		const emailsRes = await fetch('https://api.github.com/user/emails', {
			headers: {
				Authorization: `Bearer ${tokens.access_token}`,
				Accept: 'application/vnd.github+json',
				'User-Agent': 'CopixAuth',
			},
		});
		if (emailsRes.ok) {
			const emails = await emailsRes.json();
			email = emails.find(e => e.primary && e.verified)?.email
				|| emails.find(e => e.verified)?.email
				|| emails[0]?.email;
		}
	}

	return {
		provider: 'github',
		subject: String(p.id),
		email,
		name: p.name || p.login,
		avatarUrl: p.avatar_url,
	};
}

export async function appleClientSecret() {
	const key = await importPKCS8(env.apple.privateKey, 'ES256');
	return new SignJWT({})
		.setProtectedHeader({ alg: 'ES256', kid: env.apple.keyId })
		.setIssuer(env.apple.teamId)
		.setAudience('https://appleid.apple.com')
		.setSubject(env.apple.id)
		.setIssuedAt()
		.setExpirationTime('180d')
		.sign(key);
}

export async function appleAuthUrl(state) {
	const u = new URL('https://appleid.apple.com/auth/authorize');
	u.searchParams.set('client_id', env.apple.id);
	u.searchParams.set('redirect_uri', `${env.apiPublicUrl}/auth/callback/apple`);
	u.searchParams.set('response_type', 'code');
	u.searchParams.set('response_mode', 'form_post');
	u.searchParams.set('scope', 'name email');
	u.searchParams.set('state', state);
	return u.toString();
}

export async function appleExchange(code) {
	const clientSecret = await appleClientSecret();
	const body = new URLSearchParams({
		client_id: env.apple.id,
		client_secret: clientSecret,
		code,
		grant_type: 'authorization_code',
		redirect_uri: `${env.apiPublicUrl}/auth/callback/apple`,
	});
	const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body,
	});
	if (!tokenRes.ok) throw new Error(`Apple token exchange failed (${tokenRes.status})`);
	const tokens = await tokenRes.json();
	const [, payloadB64] = String(tokens.id_token || '').split('.');
	if (!payloadB64) throw new Error('Apple id_token missing');
	const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
	return {
		provider: 'apple',
		subject: payload.sub,
		email: payload.email || null,
		name: payload.email ? payload.email.split('@')[0] : 'Apple user',
		avatarUrl: null,
	};
}
