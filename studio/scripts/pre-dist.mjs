/**
 * Prepare release/staging before electron-builder.
 * Avoids failures when an old unpacked folder is locked (e.g. Copix still running).
 */
import { existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const staging = path.join(root, 'release', 'staging');
const legacyUnpacked = path.join(root, 'release', 'win-unpacked');

function killWindows(name) {
	spawnSync('taskkill', ['/F', '/IM', name, '/T'], { shell: true, stdio: 'ignore' });
}

function killUnix(pattern) {
	spawnSync('pkill', ['-f', pattern], { stdio: 'ignore' });
}

if (process.platform === 'win32') {
	killWindows('Copix.exe');
	killWindows('electron.exe');
} else {
	killUnix('Copix.app');
	killUnix('[e]lectron');
}

function tryRemove(dir) {
	if (!existsSync(dir)) return true;
	try {
		rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 400 });
		return !existsSync(dir);
	} catch {
		return false;
	}
}

if (existsSync(legacyUnpacked)) {
	const removed = tryRemove(legacyUnpacked);
	if (!removed) {
		console.warn('[pre-dist] Old release/win-unpacked is locked — building into release/staging instead.');
		console.warn('[pre-dist] Close Copix/Cursor file watchers, then delete release/win-unpacked manually.');
	}
}

tryRemove(staging);
console.log('[pre-dist] Ready — output: release/staging');
