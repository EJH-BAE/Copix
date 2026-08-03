import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { InteractiveDemo } from '../components/InteractiveDemo';
import { SiteNav } from '../components/SiteNav';
import { detectPlatform, GITHUB, RELEASES } from '../lib/platform';
import { scrollToHash } from '../lib/scroll';

const models = ['qwen2.5:3b', 'qwen2.5-coder:7b', 'mistral:7b', 'qwen3.5:4b', 'Auto'];

const changelog = [
	{ date: 'Aug 3, 2026', title: 'Copix 4.3.0 — Desktop release folder + agent creates files' },
	{ date: 'Aug 3, 2026', title: 'Standalone CLI for macOS & Windows — no accounts' },
	{ date: 'Jul 30, 2026', title: 'macOS Studio 4.2.0' },
];

const slash = [
	{ cmd: '/model', tip: 'Pin an Ollama tag or use auto routing' },
	{ cmd: '/pull', tip: 'Download a model into Ollama' },
	{ cmd: '/cwd', tip: 'Set the workspace (saved in settings)' },
	{ cmd: '/doctor', tip: 'Check Node, Ollama, models, and paths' },
	{ cmd: '/history', tip: 'Sessions shared with Desktop' },
];

export default function Landing() {
	const platform = useMemo(() => detectPlatform(), []);
	const [copied, setCopied] = useState<'cli' | 'alt' | 'desktop' | null>(null);
	const location = useLocation();

	useEffect(() => {
		document.title = platform.isKo
			? 'Copix — Desktop & CLI'
			: 'Copix — Desktop & CLI';
	}, [platform.isKo]);

	useEffect(() => {
		if (location.hash) {
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			window.setTimeout(() => scrollToHash(location.hash, reduced ? 'auto' : 'smooth'), 40);
		}
	}, [location.hash]);

	const t = platform.isKo
		? {
				kicker: 'Desktop · CLI · 로컬 모델',
				trust: '계정 없음. Copix Desktop과 독립형 CLI로 에이전트에 일을 맡기고, 결정은 당신이 하세요.',
				ctaDesktop: platform.desktopLabel,
				ctaCli: 'CLI 설치',
				trusted: '로컬 Ollama로 매일 빌드하는 팀을 위해',
				agentsTitle: '아이디어를 코드로',
				agentsBody: 'Studio와 CLI가 같은 에이전트·도구를 공유합니다. 세션은 ~/Copix에 맞춰집니다.',
				toolsTitle: '두 가지 설치면 끝',
				toolsBody: 'Desktop은 릴리스 설치 파일, CLI는 한 줄 설치 스크립트 — macOS와 Windows 모두.',
				installTitle: 'Desktop 설치',
				cliTitle: 'CLI 설치',
				cliBody: '독립형 터미널 에이전트. Node 18+, git, Ollama만 있으면 됩니다.',
				quotesTitle: '새로운 소프트웨어 만드는 방식',
				frontierTitle: '프론티어에 머무르세요',
				modelsTitle: '작업마다 맞는 모델',
				modelsBody: 'Ollama 우선. 태그를 쓰면 쓰고, 없으면 안전한 기본값으로 떨어집니다.',
				changelogTitle: '변경 사항',
				closingTitle: '지금 Copix를 써보세요.',
				copy: '복사',
				copied: '복사됨',
				noAccount: '로그인·계정·웹 앱 없음 — Desktop과 CLI만.',
			}
		: {
				kicker: 'Desktop · CLI · local models',
				trust: 'No accounts. Hand work to the agent in Copix Desktop or the standalone CLI — you stay on decisions.',
				ctaDesktop: platform.desktopLabel,
				ctaCli: 'Install CLI',
				trusted: 'Trusted by builders who keep models local',
				agentsTitle: 'Agents turn ideas into code',
				agentsBody: 'Studio and the CLI share the same agent brain and tools. Sessions sync through ~/Copix.',
				toolsTitle: 'Two ways to install',
				toolsBody: 'Desktop from Releases. CLI from a one-liner — macOS and Windows.',
				installTitle: 'Install Desktop',
				cliTitle: 'Install CLI',
				cliBody: 'Standalone terminal agent. Needs Node.js 18+, git, and Ollama — nothing else.',
				quotesTitle: 'The new way to build software',
				frontierTitle: 'Stay on the frontier',
				modelsTitle: 'Use the best model for every task',
				modelsBody: 'Ollama-first defaults. Stretch tags when you pull them.',
				changelogTitle: 'Changelog',
				closingTitle: 'Try Copix now.',
				copy: 'Copy',
				copied: 'Copied',
				noAccount: 'No login, no accounts, no web app — Desktop and CLI only.',
			};

	async function copyText(text: string, key: 'cli' | 'alt' | 'desktop') {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(key);
			window.setTimeout(() => setCopied(null), 1600);
		} catch {
			/* ignore */
		}
	}

	return (
		<div className="page">
			<SiteNav />
			<main id="top">
				<section className="hero">
					<p className="hero-kicker">{t.kicker}</p>
					<h1 className="hero-title">
						<span className="brand-hero">Copix</span>
						<br />
						{platform.isKo ? '로 소프트웨어를 만드세요.' : 'is your coding agent for ambitious software.'}
					</h1>
					<p className="hero-trust">{t.trust}</p>
					<div className="hero-cta">
						<a className="btn primary lg" href={platform.desktopUrl} target="_blank" rel="noreferrer">
							{t.ctaDesktop}
						</a>
						<a className="btn ghost lg" href="#cli">
							{t.ctaCli}
						</a>
					</div>
					<p className="hero-meta">
						{platform.isKo
							? `${platform.osLabel} · ${t.noAccount}`
							: `Detected ${platform.osLabel} · ${t.noAccount}`}
					</p>

					<div className="hero-plane" id="demo">
						<div className="hero-glow" aria-hidden />
						<InteractiveDemo />
					</div>
				</section>

				<section className="logos-strip" aria-label="Works with">
					<span>{t.trusted}</span>
					<span>Ollama</span>
					<span>macOS</span>
					<span>Windows</span>
					<span>CLI</span>
				</section>

				<section className="split" id="product">
					<article>
						<h2>{t.agentsTitle}</h2>
						<p>{t.agentsBody}</p>
						<a className="text-link" href="#demo">{platform.isKo ? '데모 보기 →' : 'See the demo →'}</a>
					</article>
					<article>
						<h2>{platform.isKo ? '로컬에서 실행' : 'Runs on your machine'}</h2>
						<p>
							{platform.isKo
								? '모델은 당신 머신에. 클라우드 계정이나 Copix 웹 앱이 없습니다.'
								: 'Keep models on your machine. No cloud account. No Copix web app.'}
						</p>
						<a className="text-link" href="#install">
							{platform.isKo ? '설치로 이동 →' : 'Go to install →'}
						</a>
					</article>
					<article>
						<h2>{platform.isKo ? '도구가 일을 끝냅니다' : 'Tools that ship work'}</h2>
						<p>
							create_project, edit_file, terminal, web_search, web_fetch —{' '}
							{platform.isKo ? '실제 파일과 웹에 닿습니다.' : 'the agent touches real files and the public web.'}
						</p>
					</article>
				</section>

				<section className="band" id="install">
					<div>
						<h2>{t.installTitle}</h2>
						<p>{t.toolsBody}</p>
						<p className="install-os">
							{platform.isKo ? '감지된 OS' : 'Detected OS'}: <strong>{platform.osLabel}</strong>
						</p>
						<p className="install-hint">{platform.desktopHint}</p>
						<div className="install-actions">
							<a className="btn primary" href={platform.desktopUrl} target="_blank" rel="noreferrer">
								{platform.desktopLabel}
							</a>
							<a className="btn ghost" href={RELEASES} target="_blank" rel="noreferrer">
								{platform.isKo ? '모든 릴리스' : 'All releases'}
							</a>
							<button type="button" className="btn ghost" onClick={() => void copyText(platform.desktopUrl, 'desktop')}>
								{copied === 'desktop' ? t.copied : t.copy}
							</button>
						</div>
					</div>
					<div>
						<h3>
							{platform.isKo
								? 'macOS: “손상되어서 열 수 없습니다”'
								: 'macOS: “damaged and can’t be opened”'}
						</h3>
						<p className="install-hint">
							{platform.isKo
								? '파일이 깨진 것이 아닙니다. Chrome 다운로드 후 Gatekeeper 격리입니다. Applications로 옮긴 뒤 터미널에서:'
								: 'The DMG is fine (checksum matches). Chrome quarantine blocks unsigned apps. After dragging to Applications, run:'}
						</p>
						<pre className="install"><code>{`xattr -cr /Applications/Copix.app
open /Applications/Copix.app`}</code></pre>
						<div className="install-actions">
							<button
								type="button"
								className="btn ghost"
								onClick={() =>
									void copyText(
										'xattr -cr /Applications/Copix.app && open /Applications/Copix.app',
										'desktop',
									)
								}
							>
								{copied === 'desktop' ? t.copied : platform.isKo ? '명령 복사' : 'Copy command'}
							</button>
						</div>
					</div>
				</section>

				<section className="band cli-band" id="cli">
					<div>
						<h2>{t.cliTitle}</h2>
						<p>{t.cliBody}</p>
						<p className="install-hint">{platform.cliHint}</p>
						<p className="install-os">
							<strong>{platform.cliLabel}</strong>
						</p>
						<pre className="install"><code>{platform.cliCommand}</code></pre>
						<div className="install-actions">
							<button type="button" className="btn primary" onClick={() => void copyText(platform.cliCommand, 'cli')}>
								{copied === 'cli' ? t.copied : t.copy}
							</button>
						</div>
						<p className="install-os" style={{ marginTop: 22 }}>
							<strong>{platform.cliAltLabel}</strong>
						</p>
						<pre className="install"><code>{platform.cliAltCommand}</code></pre>
						<div className="install-actions">
							<button type="button" className="btn ghost" onClick={() => void copyText(platform.cliAltCommand, 'alt')}>
								{copied === 'alt' ? t.copied : t.copy}
							</button>
						</div>
					</div>
					<div>
						<h3>{platform.isKo ? '설치 후' : 'After install'}</h3>
						<pre className="install"><code>{`ollama pull qwen2.5:3b
copix doctor
copix
copix "summarize this repo"`}</code></pre>
						<ul className="cli-slash">
							{slash.map((row) => (
								<li key={row.cmd}>
									<code>{row.cmd}</code>
									<span>{row.tip}</span>
								</li>
							))}
						</ul>
						<p className="install-hint">
							{platform.isKo
								? '자세한 내용은 GitHub의 cli/README.md를 보세요.'
								: 'Full reference in cli/README.md on GitHub.'}{' '}
							<a className="text-link" href={`${GITHUB}/tree/main/cli`} target="_blank" rel="noreferrer">
								{platform.isKo ? 'CLI 문서 →' : 'CLI docs →'}
							</a>
						</p>
					</div>
				</section>

				<section className="quotes">
					<h2>{t.quotesTitle}</h2>
					<div className="quote-grid">
						<figure className="quote">
							<blockquote>
								<strong>{platform.isKo ? '결정과 속도' : 'Decisions and speed'}</strong>
								{platform.isKo
									? '에이전트가 계획을 세우고 파일을 만듭니다. 나는 트리거와 UX만 골랐습니다.'
									: 'The agent planned and wrote the files. I only chose the trigger and the UX.'}
							</blockquote>
							<figcaption>
								<strong>Studio</strong>
								<span>{platform.isKo ? '로컬 에이전트 워크플로' : 'Local agent workflow'}</span>
							</figcaption>
						</figure>
						<figure className="quote">
							<blockquote>
								<strong>{platform.isKo ? 'CLI와 Desktop이 같다' : 'CLI and Desktop stay in sync'}</strong>
								{platform.isKo
									? '세션이 ~/Copix에 공유되어 터미널에서 이어할 수 있습니다.'
									: 'Sessions share through ~/Copix so I can continue from the terminal.'}
							</blockquote>
							<figcaption>
								<strong>CLI</strong>
								<span>copix agent</span>
							</figcaption>
						</figure>
						<figure className="quote">
							<blockquote>
								<strong>{platform.isKo ? '계정 없음' : 'No account'}</strong>
								{platform.isKo
									? '설치하고 Ollama를 켠 다음 바로 씁니다. 로그인 단계가 없습니다.'
									: 'Install, start Ollama, and go. There is no sign-in step.'}
							</blockquote>
							<figcaption>
								<strong>Local</strong>
								<span>Ollama</span>
							</figcaption>
						</figure>
					</div>
				</section>

				<section className="frontier" id="models">
					<h2>{t.frontierTitle}</h2>
					<div className="frontier-grid">
						<article>
							<h3>{t.modelsTitle}</h3>
							<p>{t.modelsBody}</p>
							<div className="model-chip-row">
								{models.map((m, i) => (
									<span key={m} className={`model-chip ${i === 0 ? 'active' : ''}`}>{m}</span>
								))}
							</div>
						</article>
						<article>
							<h3>{platform.isKo ? '데스크톱' : 'Desktop'}</h3>
							<p>
								{platform.isKo
									? `${platform.osLabel}용 Studio — 전체 도구 표면.`
									: `Native Studio for ${platform.osLabel} with the full tool surface.`}
							</p>
							<a className="text-link" href={RELEASES} target="_blank" rel="noreferrer">
								{platform.isKo ? '모든 릴리스 →' : 'All releases →'}
							</a>
						</article>
						<article>
							<h3>{platform.isKo ? '소유권' : 'Proprietary'}</h3>
							<p>
								{platform.isKo
									? '무료로 쓰세요. 오픈소스가 아닙니다.'
									: 'Free to use. Not open source.'}
							</p>
						</article>
					</div>
				</section>

				<section className="changelog">
					<div className="section-head">
						<h2>{t.changelogTitle}</h2>
						<a className="text-link" href={GITHUB} target="_blank" rel="noreferrer">
							GitHub →
						</a>
					</div>
					<ul>
						{changelog.map((row) => (
							<li key={row.title}>
								<time>{row.date}</time>
								<span>{row.title}</span>
							</li>
						))}
					</ul>
				</section>

				<section className="closing">
					<h2>{t.closingTitle}</h2>
					<p className="hero-trust" style={{ marginBottom: 8 }}>{t.noAccount}</p>
					<div className="hero-cta">
						<a className="btn primary lg" href={platform.desktopUrl} target="_blank" rel="noreferrer">
							{t.ctaDesktop}
						</a>
						<a className="btn ghost lg" href="#cli">
							{t.ctaCli}
						</a>
					</div>
				</section>
			</main>

			<footer className="footer">
				<div className="footer-brand">
					<img src={`${import.meta.env.BASE_URL}icon.png`} alt="" width={22} height={22} />
					<span>Copix</span>
				</div>
				<div className="footer-links">
					<a href="#product">Product</a>
					<a href="#install">Desktop</a>
					<a href="#cli">CLI</a>
					<a href={RELEASES}>Download</a>
					<a href={GITHUB}>GitHub</a>
				</div>
				<p className="footer-copy">
					© {new Date().getFullYear()} Copix. Free to use · proprietary · not open source · no accounts.
				</p>
			</footer>
		</div>
	);
}
