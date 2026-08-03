import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env, oauthProviders } from './lib/env.js';
import auth from './routes/auth.js';

const app = new Hono();

function corsOrigin(origin) {
	if (!origin) return env.appUrl;
	if (
		origin === env.appUrl
		|| origin === 'https://ejh-bae.github.io'
		|| origin.endsWith('.github.io')
		|| /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
	) {
		return origin;
	}
	return origin;
}

app.use('*', cors({
	origin: corsOrigin,
	allowHeaders: ['Content-Type', 'Authorization', 'X-Copix-Token'],
	allowMethods: ['GET', 'POST', 'OPTIONS'],
	credentials: true,
	maxAge: 86400,
}));

app.get('/', (c) => c.json({
	ok: true,
	service: 'copix-api',
	auth: oauthProviders(),
	docs: 'POST /auth/signup · /signup/verify · /login · /login/verify · /2fa/resend · GET /auth/oauth/:provider',
}));

app.get('/health', (c) => c.json({ ok: true, service: 'copix-api', time: Date.now() }));

app.route('/auth', auth);

app.onError((err, c) => {
	console.error('[copix-api]', err);
	return c.json({ ok: false, error: err?.message || 'Server error' }, 500);
});

const server = serve({ fetch: app.fetch, port: env.port, hostname: '0.0.0.0' }, (info) => {
	console.log(`Copix API listening on http://127.0.0.1:${info.port}`);
	console.log(`APP_URL=${env.appUrl}`);
	console.log('Providers:', oauthProviders());
});

server.on('error', (err) => {
	if (err?.code === 'EADDRINUSE') {
		console.error(`\n[copix-api] Port ${env.port} is already in use.`);
		console.error(`Free it with:  lsof -ti :${env.port} | xargs kill -9`);
		console.error(`Or:            npm run free-port && npm run dev\n`);
		process.exit(1);
	}
	console.error('[copix-api] listen failed:', err);
	process.exit(1);
});

process.on('uncaughtException', (err) => {
	if (err?.code === 'EADDRINUSE') {
		console.error(`[copix-api] Port ${env.port} in use — ${err.message}`);
		process.exit(1);
	}
	console.error('[copix-api] uncaughtException', err);
	process.exit(1);
});
