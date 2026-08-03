/**
 * In-memory store for users / OTP / chats.
 * Swap for Postgres/Redis in production — interface stays the same.
 */

const otps = new Map(); // email -> { code, expiresAt, attempts, purpose, pending? }
const users = new Map(); // id -> user
const usersByEmail = new Map();
const oauthLinks = new Map(); // provider:subject -> userId
const chats = new Map(); // userId -> ChatSession[]
const pending2fa = new Map(); // challengeId -> { userId, expiresAt }

export function upsertUser({ email, name, avatarUrl, provider, subject, passwordHash }) {
	const normalized = email?.toLowerCase().trim();
	let user = normalized ? usersByEmail.get(normalized) : null;
	if (!user && provider && subject) {
		const linked = oauthLinks.get(`${provider}:${subject}`);
		if (linked) user = users.get(linked) || null;
	}
	if (!user) {
		user = {
			id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
			email: normalized || null,
			name: name || (normalized ? normalized.split('@')[0] : 'Copix user'),
			avatarUrl: avatarUrl || null,
			passwordHash: passwordHash || null,
			createdAt: Date.now(),
			providers: [],
		};
		users.set(user.id, user);
		if (normalized) usersByEmail.set(normalized, user);
	} else {
		if (name && !user.name) user.name = name;
		if (avatarUrl) user.avatarUrl = avatarUrl;
		if (passwordHash) user.passwordHash = passwordHash;
		if (normalized && !user.email) {
			user.email = normalized;
			usersByEmail.set(normalized, user);
		}
	}
	if (provider && subject) {
		oauthLinks.set(`${provider}:${subject}`, user.id);
		if (!user.providers.includes(provider)) user.providers.push(provider);
	}
	return user;
}

export function publicUser(user) {
	if (!user) return null;
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		avatarUrl: user.avatarUrl,
		providers: user.providers,
		createdAt: user.createdAt,
		hasPassword: Boolean(user.passwordHash),
	};
}

export function getUser(id) {
	return publicUser(users.get(id));
}

export function getUserRecord(id) {
	return users.get(id) || null;
}

export function findUserByEmail(email) {
	return usersByEmail.get(String(email || '').toLowerCase().trim()) || null;
}

export function saveOtp(email, code, { purpose = '2fa', pending = null, ttlMs = 10 * 60 * 1000 } = {}) {
	const key = email.toLowerCase().trim();
	otps.set(key, { code, expiresAt: Date.now() + ttlMs, attempts: 0, purpose, pending });
}

export function peekOtp(email) {
	return otps.get(String(email || '').toLowerCase().trim()) || null;
}

export function verifyOtp(email, code, purpose = '2fa') {
	const key = email.toLowerCase().trim();
	const row = otps.get(key);
	if (!row) return { ok: false, error: 'No code requested for this email' };
	if (row.purpose !== purpose) return { ok: false, error: 'Wrong verification step — start again' };
	if (Date.now() > row.expiresAt) {
		otps.delete(key);
		return { ok: false, error: 'Code expired — request a new one' };
	}
	row.attempts += 1;
	if (row.attempts > 8) {
		otps.delete(key);
		return { ok: false, error: 'Too many attempts — request a new code' };
	}
	if (String(code).trim() !== row.code) {
		return { ok: false, error: 'Incorrect code' };
	}
	const pending = row.pending;
	otps.delete(key);
	return { ok: true, pending };
}

export function create2faChallenge(userId) {
	const id = `chal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
	pending2fa.set(id, { userId, expiresAt: Date.now() + 10 * 60 * 1000 });
	return id;
}

export function consume2faChallenge(id) {
	const row = pending2fa.get(id);
	pending2fa.delete(id);
	if (!row || Date.now() > row.expiresAt) return null;
	return row.userId;
}

export function listChats(userId) {
	return chats.get(userId) || [];
}

export function saveChat(userId, session) {
	const all = chats.get(userId) || [];
	const idx = all.findIndex(s => s.id === session.id);
	if (idx >= 0) all[idx] = session;
	else all.unshift(session);
	chats.set(userId, all.slice(0, 40));
	return session;
}

export function getChat(userId, id) {
	return (chats.get(userId) || []).find(s => s.id === id) || null;
}
