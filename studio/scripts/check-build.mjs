import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const distIndex = path.join(root, 'dist', 'index.html');
const distElectronMain = path.join(root, 'dist-electron', 'main.js');

if (!fs.existsSync(distIndex) || !fs.existsSync(distElectronMain)) {
	console.error('[copix] Studio UI is not built yet.');
	console.error('');
	console.error('  Development:  npm run dev');
	console.error('  Production:   npm run build && npm start');
	console.error('  Or double-click copix-studio.bat');
	process.exit(1);
}
