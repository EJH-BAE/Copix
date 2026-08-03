import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { InteractiveDemo } from '../components/InteractiveDemo';
import { SiteNav } from '../components/SiteNav';
import { useAuth } from '../lib/auth';
import { detectPlatform, GITHUB, RELEASES } from '../lib/platform';

const models = ['qwen2.5:3b', 'qwen2.5-coder:7b', 'mistral:7b', 'qwen3.5:4b', 'Auto'];

const changelog = [
	{ date: 'Aug 2, 2026', title: 'Password login + 6-digit 2FA for Copix Web' },
	{ date: 'Aug 1, 2026', title: 'Streaming agent replies in the browser' },
	{ date: 'Jul 30, 2026', title: 'macOS Studio 4.2.0' },
	{ date: 'Jul 22, 2026', title: 'Windows Studio 4.1.0' },
];

export default function Landing() {
	const { user } = useAuth();
	const platform = useMemo(() => detectPlatform(), []);
	const [copied, setCopied] = useState(false);
	const t = platform.isKo
		? {
				kicker: 'AI 코딩 에이전트',
				title: 'Copix로 소프트웨어를 만드세요.',
				trust: '결정은 당신이, 구현은 Copix가. 브라우저·데스크톱·CLI에서 같은 에이전트를 쓰세요.',
				cta: user ? 'Copix Web 열기' : '무료로 시작',
				download: platform.desktopLabel,
				trusted: '매일 로컬 모델로 빌드하는 팀을 위해',
				agentsTitle: '아이디어를 코드로',
				agentsBody: '에이전트에 작업을 맡기고 결정은 당신이 하세요. Studio, CLI, Copix Web이 같은 흐름을 공유합니다.',
				toolsTitle: '모든 도구에서',
				toolsBody: '터미널, 데스크톱, 브라우저 — 설치 명령과 파일을 OS에 맞게 안내합니다.',
				installTitle: '지금 설치',
				quotesTitle: '새로운 소프트웨어 만드는 방식',
				frontierTitle: '프론티어에 머무르세요',
				modelsTitle: '작업마다 맞는 모델',
				modelsBody: 'Ollama 우선. 태그를 쓰면 쓰고, 없으면 안전한 기본값으로 떨어집니다.',
				changelogTitle: '변경 사항',
				closingTitle: '지금 Copix를 써보세요.',
				copy: '복사',
				copied: '복사됨',
			}
		: {
				kicker: 'The AI coding agent',
				title: 'Build software with Copix.',
				trust: 'Hand work to the agent while you focus on decisions — in the browser, desktop, and CLI.',
				cta: user ? 'Open Copix Web' : 'Get started free',
				download: platform.desktopLabel,
				trusted: 'Trusted by builders who keep models local',
				agentsTitle: 'Agents turn ideas into code',
				agentsBody: 'Accelerate development by handing off tasks to Copix while you stay on decisions. Studio, CLI, and Web share one agent brain.',
				toolsTitle: 'In every tool, at every step',
				toolsBody: 'Terminal, desktop, and browser — we detect your OS and language so install commands and files match your machine.',
				installTitle: 'Install for your machine',
				quotesTitle: 'The new way to build software',
				frontierTitle: 'Stay on the frontier',
				modelsTitle: 'Use the best model for every task',
				modelsBody: 'Ollama-first defaults. Stretch tags when you pull them. Web sessions stream from your connected endpoint.',
				changelogTitle: 'Changelog',
				closingTitle: 'Try Copix now.',
				copy: 'Copy',
				copied: 'Copied',
			};

	async function copyCli() {
		try {
			await navigator.clipboard.writeText(platform.cliCommand);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
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
						{user ? (
							<Link className="btn primary lg" to="/app">{t.cta}</Link>
						) : (
							<Link className="btn primary lg" to="/signup">{t.cta}</Link>
						)}
						<a className="btn ghost lg" href={platform.desktopUrl} target="_blank" rel="noreferrer">
							{t.download}
						</a>
					</div>
					<p className="hero-meta">
						{platform.desktopHint} · {platform.isKo ? '비밀번호 + 6자리 2단계' : 'password + 6-digit 2FA'}
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
					<span>Web</span>
				</section>

				<section className="split" id="product">
					<article>
						<h2>{t.agentsTitle}</h2>
						<p>{t.agentsBody}</p>
						<a className="text-link" href="#demo">{platform.isKo ? '데모 보기 →' : 'See the demo →'}</a>
					</article>
					<article>
						<h2>{platform.isKo ? '자율적으로, 로컬에서' : 'Works locally, streams live'}</h2>
						<p>
							{platform.isKo
								? '모델은 당신 머신에. Copix Web은 로그인 후 답변을 스트리밍합니다.'
								: 'Keep models on your machine. Copix Web streams replies once you’re signed in.'}
						</p>
						<Link className="text-link" to={user ? '/app' : '/signup'}>
							{platform.isKo ? '웹에서 시작 →' : 'Start in the browser →'}
						</Link>
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
						<h2>{t.toolsTitle}</h2>
						<p>{t.toolsBody}</p>
						<p className="install-os">
							{platform.isKo ? '감지된 OS' : 'Detected OS'}: <strong>{platform.osLabel}</strong>
							{platform.isKo ? ` · 언어 ${platform.lang}` : ` · language ${platform.lang}`}
						</p>
						<div className="install-actions">
							<a className="btn primary" href={platform.desktopUrl} target="_blank" rel="noreferrer">
								{platform.desktopLabel}
							</a>
							<Link className="btn ghost" to={user ? '/app' : '/signup'}>
								{platform.isKo ? 'Copix Web' : 'Open Copix Web'}
							</Link>
						</div>
					</div>
					<div>
						<h3>{t.installTitle}</h3>
						<p className="install-hint">{platform.cliHint}</p>
						<pre className="install"><code>{platform.cliCommand}</code></pre>
						<button type="button" className="btn ghost" onClick={() => void copyCli()}>
							{copied ? t.copied : t.copy}
						</button>
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
								<strong>{platform.isKo ? '웹도 같은 제품' : 'Web feels like the product'}</strong>
								{platform.isKo
									? '비밀번호로 들어가고, 6자리 코드가 두 번째 단계입니다. 답변은 스트림됩니다.'
									: 'Password first, 6-digit code as the second step. Replies stream in.'}
							</blockquote>
							<figcaption>
								<strong>Copix Web</strong>
								<span>{platform.isKo ? '로그인 세션' : 'Signed-in sessions'}</span>
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
					<div className="hero-cta">
						<Link className="btn primary lg" to={user ? '/app' : '/signup'}>
							{t.cta}
						</Link>
						<Link className="btn ghost lg" to="/login">
							{platform.isKo ? '이미 계정이 있어요' : 'I already have an account'}
						</Link>
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
					<a href="#install">Install</a>
					<a href={RELEASES}>Download</a>
					<a href={GITHUB}>GitHub</a>
					<Link to="/login">Sign in</Link>
				</div>
				<p className="footer-copy">
					© {new Date().getFullYear()} Copix. Free to use · proprietary · not open source.
				</p>
			</footer>
		</div>
	);
}
