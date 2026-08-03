#!/usr/bin/env node
import { env, oauthProviders, oauthRedirectUris } from '../src/lib/env.js';

const status = oauthProviders();
const uris = oauthRedirectUris();

console.log('Copix OAuth status\n');
console.log(`APP_URL         ${env.appUrl}`);
console.log(`API_PUBLIC_URL  ${env.apiPublicUrl}`);
console.log('');
console.log('Providers');
console.log(`  Google  ${status.google ? 'ready' : 'missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET'}`);
console.log(`  GitHub  ${status.github ? 'ready' : 'missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET'}`);
console.log(`  Apple   ${status.apple ? 'ready' : 'missing APPLE_CLIENT_ID / TEAM_ID / KEY_ID / PRIVATE_KEY'}`);
console.log('');
console.log('Paste these redirect URIs into each provider console:');
console.log(`  Google  ${uris.google}`);
console.log(`  GitHub  ${uris.github}`);
console.log(`  Apple   ${uris.apple}`);
console.log('');
if (!status.google && !status.github && !status.apple) {
	console.log('No OAuth providers configured yet. Create apps, put secrets in api/.env, restart the API.');
	process.exitCode = 1;
} else {
	console.log('At least one provider is ready. Restart `npm run dev` after editing .env.');
}
