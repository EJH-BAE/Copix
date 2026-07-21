/**
 * afterPack — stamp Windows PE metadata so Task Manager / Properties show "Copix"
 * instead of "Electron".
 */
const ResEdit = require('resedit');
const path = require('node:path');
const fs = require('node:fs');

function parseVersion(v) {
	const parts = String(v || '1.0.0').split(/[^\d]+/).filter(Boolean).map(n => Number(n) || 0);
	while (parts.length < 4) parts.push(0);
	return parts.slice(0, 4);
}

exports.default = async function afterPack(context) {
	if (context.electronPlatformName !== 'win32') return;

	const exeName = `${context.packager.appInfo.productFilename}.exe`;
	const exePath = path.join(context.appOutDir, exeName);
	if (!fs.existsSync(exePath)) {
		console.warn('[brand] exe not found:', exePath);
		return;
	}

	const iconPath = path.join(context.packager.projectDir, 'build', 'icon.ico');
	const [maj, min, pat, build] = parseVersion(context.packager.appInfo.version);

	console.log('[brand] Stamping Copix PE metadata on', exePath);

	const data = fs.readFileSync(exePath);
	const exe = ResEdit.NtExecutable.from(data, { ignoreCert: true });
	const res = ResEdit.NtExecutableResource.from(exe);

	const viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
	const vi = viList[0] || ResEdit.Resource.VersionInfo.createEmpty();
	vi.setFileVersion(maj, min, pat, build, 1033);
	vi.setProductVersion(maj, min, pat, build, 1033);
	vi.setStringValues(
		{ lang: 1033, codepage: 1200 },
		{
			CompanyName: 'EJH-BAE',
			FileDescription: 'Copix',
			ProductName: 'Copix',
			InternalName: 'Copix',
			OriginalFilename: 'Copix.exe',
			LegalCopyright: 'Copyright © EJH-BAE',
			ProductVersion: `${maj}.${min}.${pat}.${build}`,
			FileVersion: `${maj}.${min}.${pat}.${build}`,
		},
	);
	vi.outputToResourceEntries(res.entries);

	if (fs.existsSync(iconPath)) {
		try {
			const iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(iconPath));
			const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
			const groupId = groups.length ? groups[0].id : 1;
			ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
				res.entries,
				groupId,
				1033,
				iconFile.icons.map((item) => item.data),
			);
			console.log('[brand] Icon replaced (group', groupId, ')');
		} catch (err) {
			console.warn('[brand] Icon replace skipped:', err instanceof Error ? err.message : err);
		}
	}

	res.outputResource(exe);
	fs.writeFileSync(exePath, Buffer.from(exe.generate()));
	console.log('[brand] Done — FileDescription/ProductName = Copix');
};
