import { useEffect, useMemo, useState } from 'react';

const GITHUB_URL = 'https://github.com/EJH-BAE/Copix';
const RELEASES_URL = `${GITHUB_URL}/releases`;
const ICON_URL = `${import.meta.env.BASE_URL}icon.png`;

type Lang = 'en' | 'ko';

const copy = {
	en: {
		navFeatures: 'Features',
		navHow: 'How it works',
		navDownload: 'Download',
		navDevelop: 'Develop',
		navCta: 'Get Copix',
		badge: 'AI IDE for Windows',
		heroTitle1: 'Code with clarity.',
		heroTitle2: 'Ship with Copix.',
		heroLead:
			'A native Windows IDE with agent workflows, Monaco at the core, and a workspace built for serious development — in English and Korean.',
		downloadWin: 'Download for Windows',
		viewGithub: 'View on GitHub',
		heroNote: 'Installer',
		heroNoteSuffix: 'from GitHub Releases',
		shotTitle: 'Workspace preview',
		shotHint: 'Electron · React · Monaco · Agent chat',
		featuresTitle: 'Built for professional work',
		featuresLead:
			'The density, contrast, and tooling of a full IDE — not a thin browser shell.',
		features: [
			{
				title: 'Native Windows IDE',
				description:
					'Desktop-first Electron app with system shortcuts, solid windowing, and a layout meant for long coding sessions.',
				icon: '◈',
			},
			{
				title: 'Agent workflow',
				description:
					'Chat, review diffs, and iterate without leaving the editor. Built for how developers actually ship.',
				icon: '◎',
			},
			{
				title: 'Monaco editor',
				description:
					'Industry-standard editing: syntax highlighting, multi-file work, and the precision you expect from a serious IDE.',
				icon: '▣',
			},
			{
				title: 'Team-ready paths',
				description:
					'Policy slots and configurable install paths so teams can adopt Copix on their own terms.',
				icon: '⬡',
			},
		],
		howTitle: 'How it works',
		howLead: 'From installer to your first agent-assisted commit in minutes.',
		steps: [
			{
				step: '01',
				title: 'Download',
				description: 'Get the latest x64 installer from GitHub Releases.',
			},
			{
				step: '02',
				title: 'Open a project',
				description: 'Launch Copix, open your repo, and start with agent help beside you.',
			},
			{
				step: '03',
				title: 'Ship faster',
				description: 'Use workflows, diffs, and the integrated terminal to move from idea to commit.',
			},
		],
		downloadTitle: 'Get started',
		downloadLead:
			'Install from GitHub Releases. NSIS installer supports custom paths, desktop shortcuts, and Start Menu entries.',
		downloadItems: [
			'Windows x64',
			'Per-user or custom directory install',
			'Desktop & Start Menu shortcuts',
		],
		downloadLatest: 'Download latest release',
		buildLabel: 'Build installer locally',
		developTitle: 'Develop Copix',
		developLead: 'Run the studio app locally from the product repository on main.',
		devLabel: 'Studio (from repo root)',
		layoutLabel: 'Repository layout',
		footerCopy: 'MIT License — Copyright © 2026 EJH-BAE',
		langLabel: 'Language',
		themeNote: 'Theme follows your system light / dark preference.',
	},
	ko: {
		navFeatures: '기능',
		navHow: '사용 방법',
		navDownload: '다운로드',
		navDevelop: '개발',
		navCta: 'Copix 받기',
		badge: 'Windows용 AI IDE',
		heroTitle1: '선명하게 코딩하고,',
		heroTitle2: 'Copix로 출시하세요.',
		heroLead:
			'에이전트 워크플로와 Monaco 기반 에디터를 갖춘 Windows 네이티브 IDE입니다. 영어·한국어를 모두 지원하는 본격 개발 환경입니다.',
		downloadWin: 'Windows용 다운로드',
		viewGithub: 'GitHub에서 보기',
		heroNote: '설치 파일',
		heroNoteSuffix: '· GitHub Releases',
		shotTitle: '워크스페이스 미리보기',
		shotHint: 'Electron · React · Monaco · 에이전트 채팅',
		featuresTitle: '본격적인 개발을 위해',
		featuresLead:
			'얇은 웹 껍데기가 아니라, 밀도·대비·도구가 갖춰진 풀 IDE 경험을 제공합니다.',
		features: [
			{
				title: '네이티브 Windows IDE',
				description:
					'시스템 단축키와 안정적인 창 관리, 긴 코딩 세션을 위한 데스크톱 Electron 앱입니다.',
				icon: '◈',
			},
			{
				title: '에이전트 워크플로',
				description:
					'에디터를 떠나지 않고 채팅, diff 검토, 반복 수정을 진행합니다. 실제 배포 흐름에 맞춰 설계했습니다.',
				icon: '◎',
			},
			{
				title: 'Monaco 에디터',
				description:
					'구문 강조, 다중 파일 작업 등 전문 IDE에서 기대하는 정밀한 편집 경험을 제공합니다.',
				icon: '▣',
			},
			{
				title: '팀 도입에 맞게',
				description:
					'정책 슬롯과 설치 경로 설정으로 조직 환경에 맞게 Copix를 도입할 수 있습니다.',
				icon: '⬡',
			},
		],
		howTitle: '사용 방법',
		howLead: '설치부터 에이전트와 함께하는 첫 커밋까지 몇 분이면 충분합니다.',
		steps: [
			{
				step: '01',
				title: '다운로드',
				description: 'GitHub Releases에서 최신 x64 설치 파일을 받습니다.',
			},
			{
				step: '02',
				title: '프로젝트 열기',
				description: 'Copix를 실행하고 저장소를 연 뒤, 옆에서 에이전트와 함께 시작합니다.',
			},
			{
				step: '03',
				title: '더 빠르게 출시',
				description: '워크플로, diff, 통합 터미널로 아이디어에서 커밋까지 이어갑니다.',
			},
		],
		downloadTitle: '시작하기',
		downloadLead:
			'GitHub Releases에서 설치하세요. NSIS 설치 프로그램은 사용자 지정 경로, 바탕화면·시작 메뉴 바로가기를 지원합니다.',
		downloadItems: [
			'Windows x64',
			'사용자 또는 사용자 지정 디렉터리 설치',
			'바탕화면·시작 메뉴 바로가기',
		],
		downloadLatest: '최신 릴리스 다운로드',
		buildLabel: '로컬에서 설치 파일 빌드',
		developTitle: 'Copix 개발하기',
		developLead: 'main 브랜치의 제품 저장소에서 스튜디오 앱을 로컬로 실행합니다.',
		devLabel: '스튜디오 (저장소 루트)',
		layoutLabel: '저장소 구조',
		footerCopy: 'MIT 라이선스 — Copyright © 2026 EJH-BAE',
		langLabel: '언어',
		themeNote: '테마는 시스템 라이트 / 다크 설정을 따릅니다.',
	},
} as const;

function detectLang(): Lang {
	try {
		const saved = localStorage.getItem('copix-lang');
		if (saved === 'en' || saved === 'ko') return saved;
	} catch {
		/* ignore */
	}
	const nav = typeof navigator !== 'undefined' ? navigator.language : 'en';
	return nav.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

export default function App() {
	const [lang, setLang] = useState<Lang>(detectLang);
	const t = useMemo(() => copy[lang], [lang]);

	useEffect(() => {
		document.documentElement.lang = lang;
		try {
			localStorage.setItem('copix-lang', lang);
		} catch {
			/* ignore */
		}
	}, [lang]);

	return (
		<>
			<header className="nav">
				<a className="nav-brand" href="#top">
					<img src={ICON_URL} alt="" width={28} height={28} />
					<span>Copix</span>
				</a>
				<nav className="nav-links" aria-label={lang === 'ko' ? '주요' : 'Primary'}>
					<a href="#features">{t.navFeatures}</a>
					<a href="#how-it-works">{t.navHow}</a>
					<a href="#download">{t.navDownload}</a>
					<a href="#develop">{t.navDevelop}</a>
				</nav>
				<div className="nav-actions">
					<div className="lang-switch" role="group" aria-label={t.langLabel}>
						<button
							type="button"
							className={lang === 'en' ? 'is-active' : undefined}
							onClick={() => setLang('en')}
						>
							EN
						</button>
						<button
							type="button"
							className={lang === 'ko' ? 'is-active' : undefined}
							onClick={() => setLang('ko')}
						>
							한국어
						</button>
					</div>
					<a className="nav-cta" href={RELEASES_URL} target="_blank" rel="noreferrer">
						{t.navCta}
					</a>
				</div>
			</header>

			<main id="top">
				<section className="hero">
					<div className="hero-glow" aria-hidden="true" />
					<div className="hero-content">
						<p className="hero-badge">{t.badge}</p>
						<h1>
							{t.heroTitle1}
							<br />
							<span className="accent-text">{t.heroTitle2}</span>
						</h1>
						<p className="hero-lead">{t.heroLead}</p>
						<div className="hero-actions">
							<a className="btn btn-primary" href={RELEASES_URL} target="_blank" rel="noreferrer">
								{t.downloadWin}
							</a>
							<a className="btn btn-secondary" href={GITHUB_URL} target="_blank" rel="noreferrer">
								{t.viewGithub}
							</a>
						</div>
						<p className="hero-note">
							{t.heroNote}: <code>Copix-Setup-x64.exe</code> {t.heroNoteSuffix}
						</p>
						<p className="theme-note">{t.themeNote}</p>
					</div>
					<div className="hero-visual">
						<div className="screenshot-frame">
							<div className="screenshot-chrome">
								<span />
								<span />
								<span />
							</div>
							<div className="screenshot-placeholder">
								<img src={ICON_URL} alt="Copix" className="screenshot-logo" />
								<p>{t.shotTitle}</p>
								<span className="screenshot-hint">{t.shotHint}</span>
							</div>
						</div>
					</div>
				</section>

				<section className="section" id="features">
					<div className="section-header">
						<h2>{t.featuresTitle}</h2>
						<p>{t.featuresLead}</p>
					</div>
					<div className="feature-grid">
						{t.features.map(f => (
							<article key={f.title} className="feature-card">
								<span className="feature-icon" aria-hidden="true">
									{f.icon}
								</span>
								<h3>{f.title}</h3>
								<p>{f.description}</p>
							</article>
						))}
					</div>
				</section>

				<section className="section section-alt" id="how-it-works">
					<div className="section-header">
						<h2>{t.howTitle}</h2>
						<p>{t.howLead}</p>
					</div>
					<ol className="steps">
						{t.steps.map(s => (
							<li key={s.step} className="step-card">
								<span className="step-num">{s.step}</span>
								<h3>{s.title}</h3>
								<p>{s.description}</p>
							</li>
						))}
					</ol>
				</section>

				<section className="section download-section" id="download">
					<div className="download-card">
						<div className="download-content">
							<h2>{t.downloadTitle}</h2>
							<p>{t.downloadLead}</p>
							<ul className="download-list">
								{t.downloadItems.map(item => (
									<li key={item}>{item}</li>
								))}
							</ul>
							<a className="btn btn-primary" href={RELEASES_URL} target="_blank" rel="noreferrer">
								{t.downloadLatest}
							</a>
						</div>
						<div className="code-block">
							<div className="code-label">{t.buildLabel}</div>
							<pre>
								<code>{`npm run dist
# → studio/release/Copix-Setup-*.exe`}</code>
							</pre>
						</div>
					</div>
				</section>

				<section className="section section-alt" id="develop">
					<div className="section-header">
						<h2>{t.developTitle}</h2>
						<p>{t.developLead}</p>
					</div>
					<div className="develop-grid">
						<div className="code-block">
							<div className="code-label">{t.devLabel}</div>
							<pre>
								<code>{`cd studio
npm install
npm run studio`}</code>
							</pre>
						</div>
						<div className="repo-layout">
							<div className="code-label">{t.layoutLabel}</div>
							<pre className="tree">
								<code>{`Copix/
├── studio/      # Desktop app
├── resources/   # Brand assets
├── policies/
└── tools/`}</code>
							</pre>
						</div>
					</div>
				</section>
			</main>

			<footer className="footer">
				<div className="footer-inner">
					<a className="footer-brand" href="#top">
						<img src={ICON_URL} alt="" width={22} height={22} />
						<span>Copix</span>
					</a>
					<p className="footer-copy">{t.footerCopy}</p>
					<nav className="footer-links">
						<a href={GITHUB_URL} target="_blank" rel="noreferrer">
							GitHub
						</a>
						<a href={RELEASES_URL} target="_blank" rel="noreferrer">
							Releases
						</a>
						<a href={`${GITHUB_URL}/blob/main/LICENSE.txt`} target="_blank" rel="noreferrer">
							License
						</a>
					</nav>
				</div>
			</footer>
		</>
	);
}
