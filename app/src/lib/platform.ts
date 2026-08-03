export type DetectedOs = 'mac' | 'windows' | 'linux' | 'other';

export type PlatformInfo = {
	os: DetectedOs;
	osLabel: string;
	lang: string;
	isKo: boolean;
	cliCommand: string;
	desktopLabel: string;
	desktopUrl: string;
	desktopHint: string;
	cliHint: string;
};

const GITHUB = 'https://github.com/EJH-BAE/Copix';
const RELEASES = `${GITHUB}/releases`;
const MAC_DMG = `${GITHUB}/releases/download/v4.2.0_macOS/Copix-4.2.0-macOS-arm64.dmg`;
const WIN_EXE = `${GITHUB}/releases/download/v4.1.0/Copix-4.1.0-Windows-x64.exe`;
/** CLI is distributed via Releases / Studio — not from public source. */
const CLI_INSTALL = `# Copix CLI ships with Studio releases — see ${RELEASES}`;

export function detectPlatform(
	ua = typeof navigator !== 'undefined' ? navigator.userAgent : '',
	lang = typeof navigator !== 'undefined' ? navigator.language : 'en',
	platform =
		typeof navigator !== 'undefined'
			? (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform
				|| navigator.platform
				|| ''
			: '',
): PlatformInfo {
	const lower = ua.toLowerCase();
	const plat = String(platform).toLowerCase();
	let os: DetectedOs = 'other';
	if (/iphone|ipad|ipod/.test(lower) || /mac os|macintosh/.test(lower) || plat.includes('mac')) os = 'mac';
	else if (/windows|win64|win32/.test(lower) || plat.includes('win')) os = 'windows';
	else if ((/linux|x11/.test(lower) || plat.includes('linux')) && !/android/.test(lower)) os = 'linux';

	const isKo = lang.toLowerCase().startsWith('ko');
	const isArmMac = os === 'mac' && (/arm|aarch64/.test(lower) || /apple/.test(plat));

	const osLabel =
		os === 'mac' ? (isArmMac ? 'macOS (Apple Silicon)' : 'macOS') :
		os === 'windows' ? 'Windows' :
		os === 'linux' ? 'Linux' :
		isKo ? '내 기기' : 'your device';

	const desktopLabel =
		os === 'mac'
			? isKo
				? 'macOS용 Studio 다운로드 (.DMG)'
				: 'Download Studio for macOS (.DMG)'
			: os === 'windows'
				? isKo
					? 'Windows용 Studio 다운로드 (.EXE)'
					: 'Download Studio for Windows (.EXE)'
				: isKo
					? '릴리스에서 데스크톱 받기'
					: 'Get desktop from releases';

	const desktopUrl =
		os === 'mac' ? MAC_DMG : os === 'windows' ? WIN_EXE : RELEASES;

	const desktopHint = isKo
		? os === 'mac'
			? '감지됨: macOS — DMG를 열고 Applications로 드래그하세요.'
			: os === 'windows'
				? '감지됨: Windows — EXE 설치 파일을 실행하세요.'
				: '운영체제를 자동으로 특정하지 못했습니다. 릴리스 페이지에서 맞는 빌드를 고르세요.'
		: os === 'mac'
			? 'Detected macOS — open the DMG and drag Studio into Applications.'
			: os === 'windows'
				? 'Detected Windows — run the EXE installer from the release.'
				: 'OS not detected precisely — pick the matching build on the releases page.';

	const cliHint = isKo
		? 'CLI는 공개 소스로 배포되지 않습니다. Studio 릴리스와 Copix Web을 이용하세요.'
		: 'CLI is not published as public source. Use Studio releases or Copix Web.';

	return {
		os,
		osLabel,
		lang,
		isKo,
		cliCommand: CLI_INSTALL,
		desktopLabel,
		desktopUrl,
		desktopHint,
		cliHint,
	};
}

export { GITHUB, RELEASES, CLI_INSTALL };
