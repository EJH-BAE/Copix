/**
 * Copy installer artifacts from release/staging to release/ for easy discovery.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const staging = path.join(root, 'release', 'staging');
const release = path.join(root, 'release');

if (!existsSync(staging)) {
	console.warn('[post-dist] No staging folder — skip copy');
	process.exit(0);
}

mkdirSync(release, { recursive: true });

const artifactExt = /\.(exe|blockmap|dmg|zip)$/i;

for (const name of readdirSync(staging)) {
	if (!artifactExt.test(name)) continue;
	const from = path.join(staging, name);
	if (!statSync(from).isFile()) continue;
	const to = path.join(release, name);
	copyFileSync(from, to);
	console.log('[post-dist] Copied', name, '→ release/');
}

const winUnpacked = path.join(staging, 'win-unpacked', 'Copix.exe');
if (existsSync(winUnpacked)) {
	console.log('[post-dist] App folder:', path.join(staging, 'win-unpacked'));
}

for (const name of readdirSync(staging)) {
	if (!/^mac/i.test(name)) continue;
	const appPath = path.join(staging, name, 'Copix.app');
	if (existsSync(appPath)) {
		console.log('[post-dist] App folder:', appPath);
	}
}
