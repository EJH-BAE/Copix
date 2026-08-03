export type DetectedOs = 'mac' | 'windows' | 'linux' | 'other';

export type PlatformInfo = {
	os: DetectedOs;
	osLabel: string;
	lang: string;
	isKo: boolean;
	desktopLabel: string;
	desktopUrl: string;
	desktopHint: string;
	cliLabel: string;
	cliCommand: string;
	cliHint: string;
	cliAltLabel: string;
	cliAltCommand: string;
};

const GITHUB = 'https://github.com/EJH-BAE/Copix';
const RELEASES = `${GITHUB}/releases`;
const MAC_DMG = `${GITHUB}/releases/download/v4.3.0/Copix-4.3.0-macOS-arm64.dmg`;
const WIN_EXE = `${GITHUB}/releases/download/v4.3.0/Copix-4.3.0-Windows-x64.exe`;
const CLI_SH = 'curl -fsSL https://raw.githubusercontent.com/EJH-BAE/Copix/refs/heads/main/cli/install.sh | bash';
const CLI_PS = 'irm https://raw.githubusercontent.com/EJH-BAE/Copix/refs/heads/main/cli/install.ps1 | iex';

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
			? '감지됨: macOS — DMG → Applications. “손상됨”이면: xattr -cr /Applications/Copix.app && open /Applications/Copix.app'
			: os === 'windows'
				? '감지됨: Windows — EXE 설치 파일을 실행하세요.'
				: '릴리스 페이지에서 맞는 Studio 빌드를 고르세요.'
		: os === 'mac'
			? 'Detected macOS — open the DMG and drag into Applications. If “damaged”: xattr -cr /Applications/Copix.app && open /Applications/Copix.app'
			: os === 'windows'
				? 'Detected Windows — run the EXE installer from the release.'
				: 'Pick the matching Studio build on the releases page.';

	const isWindows = os === 'windows';
	const cliLabel = isWindows
		? isKo
			? 'Windows용 CLI 설치 (PowerShell)'
			: 'Install CLI on Windows (PowerShell)'
		: isKo
			? 'macOS / Linux용 CLI 설치'
			: 'Install CLI on macOS / Linux';
	const cliCommand = isWindows ? CLI_PS : CLI_SH;
	const cliAltLabel = isWindows
		? isKo
			? 'macOS / Linux'
			: 'macOS / Linux'
		: isKo
			? 'Windows (PowerShell)'
			: 'Windows (PowerShell)';
	const cliAltCommand = isWindows ? CLI_SH : CLI_PS;

	const cliHint = isKo
		? '계정 없음. Node.js 18+, git, Ollama만 있으면 됩니다. 설치 스크립트가 PATH에 영구 등록합니다.'
		: 'No account. Needs Node.js 18+, git, and Ollama. The installer puts copix on your PATH permanently.';

	return {
		os,
		osLabel,
		lang,
		isKo,
		desktopLabel,
		desktopUrl,
		desktopHint,
		cliLabel,
		cliCommand,
		cliHint,
		cliAltLabel,
		cliAltCommand,
	};
}

export { GITHUB, RELEASES, CLI_SH, CLI_PS, MAC_DMG, WIN_EXE };
