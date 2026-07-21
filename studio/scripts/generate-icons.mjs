/**
 * Regenerate build/icon.ico and build/installerIcon.ico from build/icon.png.
 * Requires: pip install pillow
 */
import { copyFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const png = path.join(root, 'build', 'icon.png');
const ico = path.join(root, 'build', 'icon.ico');

if (!existsSync(png)) {
	console.error('Missing source icon:', png);
	process.exit(1);
}

const py = `
from PIL import Image
png = r"${png.replace(/\\/g, '\\\\')}"
ico = r"${ico.replace(/\\/g, '\\\\')}"
img = Image.open(png).convert('RGBA')
base = img.resize((256, 256), Image.Resampling.LANCZOS)
sizes = [(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)]
base.save(ico, format='ICO', sizes=sizes)
print('Wrote', ico)
`;

const result = spawnSync('python', ['-c', py], { stdio: 'inherit' });
if (result.status !== 0) {
	process.exit(result.status ?? 1);
}

copyFileSync(ico, path.join(root, 'build', 'installerIcon.ico'));
copyFileSync(png, path.join(root, 'public', 'favicon.png'));
console.log('Synced installerIcon.ico and public/favicon.png');
