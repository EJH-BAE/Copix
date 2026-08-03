import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env, oauthProviders } from './lib/env.js';
import auth from './routes/auth.js';
import agent from './routes/agent.js';

const app = new Hono();

app.use('*', cors({
	origin: (origin) => origin || env.appUrl,
	allowHeaders: ['Content-Type', 'Authorization', 'X-Copix-Token'],
	allowMethods: ['GET', 'POST', 'OPTIONS'],
	credentials: true,
}));

app.get('/', (c) => c.json({
	ok: true,
	service: 'copix-api',
	auth: oauthProviders(),
	docs: 'POST /auth/signup · /signup/verify · /login · /login/verify · /2fa/resend · GET /auth/oauth/:provider · POST /agent/chats/:id/stream',
}));

app.get('/health', (c) => c.json({ ok: true }));

app.route('/auth', auth);
app.route('/agent', agent);

serve({ fetch: app.fetch, port: env.port }, (info) => {
	console.log(`Copix API listening on http://localhost:${info.port}`);
	console.log(`APP_URL=${env.appUrl}`);
	console.log('Providers:', oauthProviders());
});
