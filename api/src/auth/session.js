import { SignJWT, jwtVerify } from 'jose';
import { env } from '../lib/env.js';
import { getUser } from '../lib/store.js';

const encoder = new TextEncoder();

function secretKey() {
	return encoder.encode(env.jwtSecret);
}

export async function signSession(userId) {
	return new SignJWT({ sub: userId })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('30d')
		.sign(secretKey());
}

export async function verifySession(token) {
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, secretKey());
		const user = getUser(String(payload.sub || ''));
		return user;
	} catch {
		return null;
	}
}

export function readBearer(c) {
	const h = c.req.header('authorization') || '';
	const m = h.match(/^Bearer\s+(.+)$/i);
	return m?.[1] || c.req.header('x-copix-token') || null;
}
