const GITHUB_URL = 'https://github.com/EJH-BAE/Copix';
const RELEASES_URL = `${GITHUB_URL}/releases`;
const ICON_URL = `${import.meta.env.BASE_URL}icon.png`;

const features = [
	{
		title: 'Native Windows IDE',
		description:
			'A full desktop application built on Electron — not a browser tab. Fast startup, native shortcuts, and a Cursor-style layout you already know.',
		icon: '◈',
	},
	{
		title: 'AI-Powered Workflow',
		description:
			'Chat with an agent, review diffs, and iterate on code without leaving the editor. Built for the way modern developers actually work.',
		icon: '◎',
	},
	{
		title: 'Monaco Editor Core',
		description:
			'Industry-standard editing with syntax highlighting, multi-file support, and the polish you expect from a professional IDE.',
		icon: '▣',
	},
	{
		title: 'Enterprise Ready',
		description:
			'Policy slots and configurable deployment paths so teams can adopt Copix on their own terms.',
		icon: '⬡',
	},
];

const steps = [
	{
		step: '01',
		title: 'Download',
		description: 'Grab the latest installer from GitHub Releases — one click, x64 Windows.',
	},
	{
		step: '02',
		title: 'Open a project',
		description: 'Launch Copix, open your repo, and start coding with AI assistance at your side.',
	},
	{
		step: '03',
		title: 'Ship faster',
		description: 'Use agent workflows, inline diffs, and integrated terminal to move from idea to commit.',
	},
];

function Nav() {
	return (
		<header className="nav">
			<a className="nav-brand" href="#">
				<img src={ICON_URL} alt="" width={32} height={32} />
				<span>Copix</span>
			</a>
			<nav className="nav-links" aria-label="Primary">
				<a href="#features">Features</a>
				<a href="#how-it-works">How it works</a>
				<a href="#download">Download</a>
				<a href="#develop">Develop</a>
			</nav>
			<a className="nav-cta" href={RELEASES_URL} target="_blank" rel="noreferrer">
				Get Copix
			</a>
		</header>
	);
}

function Hero() {
	return (
		<section className="hero">
			<div className="hero-glow" aria-hidden="true" />
			<div className="hero-content">
				<div className="hero-badge">Official AI IDE for Windows</div>
				<h1>
					Code with clarity.
					<br />
					<span className="gradient-text">Ship with Copix.</span>
				</h1>
				<p className="hero-lead">
					Copix is the official AI IDE for Windows — a native desktop editor with
					agent-powered workflows, Monaco at its core, and a dark-first design built
					for long sessions.
				</p>
				<div className="hero-actions">
					<a className="btn btn-primary" href={RELEASES_URL} target="_blank" rel="noreferrer">
						Download for Windows
					</a>
					<a className="btn btn-secondary" href={GITHUB_URL} target="_blank" rel="noreferrer">
						View on GitHub
					</a>
				</div>
				<p className="hero-note">
					Installer: <code>Copix-Setup-x64.exe</code> from GitHub Releases
				</p>
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
						<p>Screenshot coming soon</p>
						<span className="screenshot-hint">Electron + React · Monaco · AI chat</span>
					</div>
				</div>
			</div>
		</section>
	);
}

function Features() {
	return (
		<section className="section" id="features">
			<div className="section-header">
				<h2>Built for Windows developers</h2>
				<p>
					Everything you need in a modern AI IDE — without the compromises of a
					web-only experience.
				</p>
			</div>
			<div className="feature-grid">
				{features.map((f) => (
					<article key={f.title} className="feature-card">
						<div className="feature-icon" aria-hidden="true">
							{f.icon}
						</div>
						<h3>{f.title}</h3>
						<p>{f.description}</p>
					</article>
				))}
			</div>
		</section>
	);
}

function HowItWorks() {
	return (
		<section className="section section-alt" id="how-it-works">
			<div className="section-header">
				<h2>How it works</h2>
				<p>From download to your first AI-assisted commit in minutes.</p>
			</div>
			<ol className="steps">
				{steps.map((s) => (
					<li key={s.step} className="step-card">
						<span className="step-num">{s.step}</span>
						<h3>{s.title}</h3>
						<p>{s.description}</p>
					</li>
				))}
			</ol>
		</section>
	);
}

function Download() {
	return (
		<section className="section download-section" id="download">
			<div className="download-card">
				<div className="download-content">
					<h2>Get started</h2>
					<p>
						Install from GitHub Releases. The NSIS installer supports custom install
						paths, desktop shortcuts, and Start Menu entries.
					</p>
					<ul className="download-list">
						<li>Windows x64</li>
						<li>Per-user or custom directory install</li>
						<li>Desktop &amp; Start Menu shortcuts</li>
					</ul>
					<a className="btn btn-primary btn-lg" href={RELEASES_URL} target="_blank" rel="noreferrer">
						Download latest release
					</a>
				</div>
				<div className="download-aside">
					<div className="code-block">
						<div className="code-label">Build installer locally</div>
						<pre>
							<code>{`cd D:\\Copix\nnpm run dist`}</code>
						</pre>
						<p className="code-output">
							Output: <code>studio\\release\\Copix-Setup-*.exe</code>
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

function Develop() {
	return (
		<section className="section section-alt" id="develop">
			<div className="section-header">
				<h2>Develop Copix</h2>
				<p>Run the studio app locally from the repository.</p>
			</div>
			<div className="develop-grid">
				<div className="code-block">
					<div className="code-label">Quick start</div>
					<pre>
						<code>{`cd studio\nnpm install\nnpm run studio`}</code>
					</pre>
				</div>
				<div className="code-block">
					<div className="code-label">From repo root</div>
					<pre>
						<code>copix-studio.bat</code>
					</pre>
				</div>
			</div>
			<div className="repo-layout">
				<div className="code-label">Repository layout</div>
				<pre className="tree">
					<code>{`Copix/
├── studio/          Application source (Electron + React)
├── resources/       Brand assets (icons, manifest templates)
├── policies/        Enterprise policy slot
├── tools/           Helper scripts
├── website/         This marketing site
├── LICENSE.txt
└── README.md`}</code>
				</pre>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className="footer">
			<div className="footer-inner">
				<div className="footer-brand">
					<img src={ICON_URL} alt="" width={24} height={24} />
					<span>Copix</span>
				</div>
				<p className="footer-copy">
					MIT License — Copyright © 2026 EJH-BAE
				</p>
				<div className="footer-links">
					<a href={GITHUB_URL} target="_blank" rel="noreferrer">
						GitHub
					</a>
					<a href={RELEASES_URL} target="_blank" rel="noreferrer">
						Releases
					</a>
					<a href={`${GITHUB_URL}/blob/main/LICENSE.txt`} target="_blank" rel="noreferrer">
						License
					</a>
				</div>
			</div>
		</footer>
	);
}

export default function App() {
	return (
		<>
			<Nav />
			<main>
				<Hero />
				<Features />
				<HowItWorks />
				<Download />
				<Develop />
			</main>
			<Footer />
		</>
	);
}
