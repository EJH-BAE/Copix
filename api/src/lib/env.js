import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

/** Lightweight .env loader (no dependency). */
export function loadEnv() {
	const file = path.join(root, '.env');
	if (!fs.existsSync(file)) return;
	for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
		const t = line.trim();
		if (!t || t.startsWith('#')) continue;
		const i = t.indexOf('=');
		if (i < 0) continue;
		const key = t.slice(0, i).trim();
		let val = t.slice(i + 1).trim();
		if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
			val = val.slice(1, -1);
		}
		if (!(key in process.env)) process.env[key] = val;
	}
}

loadEnv();

export const env = {
	port: Number(process.env.PORT || 8787),
	appUrl: (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, ''),
	apiPublicUrl: (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 8787}`).replace(/\/$/, ''),
	jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
	smtp: {
		host: process.env.SMTP_HOST || '',
		port: Number(process.env.SMTP_PORT || 465),
		secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
		user: process.env.SMTP_USER || '',
		pass: process.env.SMTP_PASS || '',
		from: process.env.EMAIL_FROM || 'Copix <noreply@localhost>',
	},
	google: {
		id: process.env.GOOGLE_CLIENT_ID || '',
		secret: process.env.GOOGLE_CLIENT_SECRET || '',
	},
	github: {
		id: process.env.GITHUB_CLIENT_ID || '',
		secret: process.env.GITHUB_CLIENT_SECRET || '',
	},
	apple: {
		id: process.env.APPLE_CLIENT_ID || '',
		teamId: process.env.APPLE_TEAM_ID || '',
		keyId: process.env.APPLE_KEY_ID || '',
		privateKey: (process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
	},
};

export function oauthProviders() {
	return {
		google: Boolean(env.google.id && env.google.secret),
		github: Boolean(env.github.id && env.github.secret),
		apple: Boolean(env.apple.id && env.apple.teamId && env.apple.keyId && env.apple.privateKey),
		password: true,
		twoFactor: true,
	};
}

/** Public redirect URIs to paste into provider consoles. */
export function oauthRedirectUris() {
	const base = env.apiPublicUrl;
	return {
		google: `${base}/auth/callback/google`,
		github: `${base}/auth/callback/github`,
		apple: `${base}/auth/callback/apple`,
		appUrl: env.appUrl,
		apiPublicUrl: base,
	};
}
