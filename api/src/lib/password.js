import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);

export async function hashPassword(password) {
	const salt = crypto.randomBytes(16).toString('hex');
	const derived = await scrypt(password, salt, 64);
	return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
	if (!stored || !stored.includes(':')) return false;
	const [salt, hash] = stored.split(':');
	const derived = await scrypt(password, salt, 64);
	const a = Buffer.from(hash, 'hex');
	const b = derived;
	if (a.length !== b.length) return false;
	return crypto.timingSafeEqual(a, b);
}

export function validatePassword(password) {
	if (typeof password !== 'string' || password.length < 8) {
		return 'Password must be at least 8 characters';
	}
	if (password.length > 128) return 'Password is too long';
	return null;
}
