#!/usr/bin/env node
/**
 * Free a TCP port before starting the API (macOS / Linux).
 * Usage: node scripts/free-port.mjs [port]
 */
import { execSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const port = Number(process.argv[2] || process.env.PORT || 8787);
if (!Number.isFinite(port) || port < 1) process.exit(0);

function pidsOnPort(p) {
	try {
		const out = execSync(`lsof -tiTCP:${p} -sTCP:LISTEN`, {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
		return out ? out.split(/\s+/).filter(Boolean) : [];
	} catch {
		return [];
	}
}

const pids = pidsOnPort(port);
if (!pids.length) {
	console.log(`[copix-api] port ${port} is free`);
	process.exit(0);
}

console.log(`[copix-api] port ${port} busy (pids ${pids.join(', ')}) — freeing`);
for (const pid of pids) {
	try {
		process.kill(Number(pid), 'SIGKILL');
	} catch {
		/* already gone */
	}
}

await sleep(250);
const still = pidsOnPort(port);
if (still.length) {
	console.error(`[copix-api] could not free port ${port}; still held by ${still.join(', ')}`);
	process.exit(1);
}
console.log(`[copix-api] port ${port} ready`);
