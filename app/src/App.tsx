const GITHUB = 'https://github.com/EJH-BAE/Copix';
const RELEASES = `${GITHUB}/releases`;
const INSTALL = 'curl -fsSL https://raw.githubusercontent.com/EJH-BAE/Copix/main/cli/install.sh | bash';
const ICON = `${import.meta.env.BASE_URL}icon.png`;

const pillars = [
	{
		title: 'Local-first by default',
		body: 'Agents run on your Mac or Windows machine with Ollama. Your code stays on disk — no account required.',
	},
	{
		title: 'Desktop and terminal, same brain',
		body: 'Copix Studio and the Copix CLI share one agent loop, one tool surface, and one settings file.',
	},
	{
		title: 'Projects with real names',
		body: 'New work lands under your user folder with readable names like ollama-dev-agent — not agent-1785…',
	},
];

const truths = [
	{
		title: 'No login wall',
		body: 'Open the app, open a folder, start building. Preferences live in ~/Copix/settings.json.',
	},
	{
		title: 'Bring your own model',
		body: 'Start with local Ollama. Swap models when you want — Copix does not lock you into a hosted plan.',
	},
	{
		title: 'Tools that touch the real filesystem',
		body: 'Read, edit, create projects, run the shell, search with ripgrep — the agent works where you work.',
	},
];

const changelog = [
	{ date: 'Aug 2, 2026', title: 'CLI synced with Desktop agent tools' },
	{ date: 'Aug 2, 2026', title: 'Default workspace is your user home' },
	{ date: 'Aug 2, 2026', title: 'Ollama-first defaults for Studio and CLI' },
	{ date: 'Jul 30, 2026', title: 'Denser Agents UI and model picker' },
];

const notes = [
	{
		date: 'Aug 2, 2026',
		tag: 'Product',
		title: 'One agent for Studio and the terminal',
		author: 'Copix Team',
		mins: 4,
	},
	{
		date: 'Aug 2, 2026',
		tag: 'Product',
		title: 'Home folder workspaces and named projects',
		author: 'Copix Team',
		mins: 3,
	},
	{
		date: 'Jul 28, 2026',
		tag: 'Product',
		title: 'Native builds for macOS and Windows',
		author: 'Copix Team',
		mins: 5,
	},
	{
		date: 'Jul 22, 2026',
		tag: 'Product',
		title: 'Integrated editor, terminal, and file tree',
		author: 'Copix Team',
		mins: 4,
	},
];

const models = ['qwen2.5:3b', 'qwen2.5-coder:7b', 'mistral:7b', 'qwen3.5:4b', 'Auto'];

export default function App() {
	return (
		<div className="page">
			<header className="nav">
				<a className="nav-brand" href="#top" aria-label="Copix home">
					<img src={ICON} alt="" width={28} height={28} />
					<span>Copix</span>
				</a>
				<nav className="nav-links" aria-label="Primary">
					<a href="#product">Product</a>
					<a href="#install">Install</a>
					<a href="#models">Models</a>
					<a href="#changelog">Changelog</a>
					<a href={GITHUB} target="_blank" rel="noreferrer">
						GitHub
					</a>
				</nav>
				<div className="nav-actions">
					<a className="btn ghost" href={GITHUB} target="_blank" rel="noreferrer">
						Source
					</a>
					<a className="btn primary" href={RELEASES} target="_blank" rel="noreferrer">
						Download
					</a>
				</div>
			</header>

			<main id="top">
				<section className="hero">
					<p className="hero-kicker">Free desktop coding agent</p>
					<h1 className="hero-title">
						Copix.
						<br />
						Fast. Efficient. Precise.
					</h1>
					<p className="hero-trust">
						Turn intent into real code on your machine — with your models, your folders, and a matching CLI.
					</p>
					<div className="hero-cta">
						<a className="btn primary lg" href={RELEASES} target="_blank" rel="noreferrer">
							Get the desktop app
						</a>
						<a className="btn ghost lg" href="#install">
							Install the CLI
						</a>
					</div>
					<div className="hero-plane" aria-hidden="true">
						<div className="hero-glow" />
						<div className="product-frame">
							<div className="product-chrome">
								<span />
								<span />
								<span />
								<em>copix · ~/sites/marketing-site</em>
							</div>
							<div className="product-body">
								<aside className="product-side">
									<div className="side-row">New Agent</div>
									<div className="side-row">Search</div>
									<div className="side-label">Home</div>
									<div className="side-repo active">marketing-site</div>
									<div className="side-repo">ollama-dev-agent</div>
									<div className="side-repo">invoice-dashboard</div>
								</aside>
								<div className="product-chat">
									<div className="chat-bubble user">
										Create a marketing site template in ~/sites and wire a clean hero.
									</div>
									<div className="chat-meta">create_project · write_file · edit_file</div>
									<div className="chat-bubble assistant">
										Created <strong>marketing-site</strong> under your sites folder. Hero, nav, and install CTA are in place — open the folder to review.
									</div>
									<div className="chat-summary">
										<strong>Done</strong>
										Project at ~/sites/marketing-site · README + index.html + styles.css
									</div>
									<div className="chat-composer">
										<span>Send follow-up…</span>
										<em>Ollama · qwen2.5-coder</em>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="split" id="product">
					{pillars.map(p => (
						<article key={p.title}>
							<h2>{p.title}</h2>
							<p>{p.body}</p>
						</article>
					))}
				</section>

				<section className="band" id="install">
					<div className="band-copy">
						<h2>Desktop app. Terminal. Same settings.</h2>
						<p>
							Install the CLI once — it uses the same agent tools as Studio and reads ~/Copix/settings.json.
						</p>
						<pre className="install">
							<code>{INSTALL}</code>
						</pre>
					</div>
					<div className="band-copy">
						<h2>Open a folder. Start.</h2>
						<p>
							Agents begin in your user home so the whole machine is reachable. New apps get kebab-case names under home or a parent you name.
						</p>
						<a className="text-link" href={RELEASES} target="_blank" rel="noreferrer">
							Download for macOS or Windows →
						</a>
					</div>
				</section>

				<section className="quotes">
					<h2>Built for people who ship.</h2>
					<div className="quote-grid">
						{truths.map(t => (
							<figure key={t.title} className="quote">
								<blockquote>
									<strong>{t.title}</strong>
									<br />
									{t.body}
								</blockquote>
							</figure>
						))}
					</div>
				</section>

				<section className="frontier" id="models">
					<h2>Pick the model. Keep the keys.</h2>
					<div className="frontier-grid">
						<article>
							<h3>Local Ollama first</h3>
							<p>
								Copix defaults to Ollama so you can work offline and privately. Pull a model and go.
							</p>
							<div className="model-chip-row">
								{models.map((m, i) => (
									<span key={m} className={`model-chip${i === 1 ? ' active' : ''}`}>
										{m}
									</span>
								))}
							</div>
						</article>
						<article>
							<h3>Agents that edit and run</h3>
							<p>Create projects, patch files, search the tree, and run shell commands — then report what changed.</p>
						</article>
						<article>
							<h3>Native macOS & Windows</h3>
							<p>No browser sandbox for your main workflow. Studio is a real desktop IDE panel with chat, files, and terminal.</p>
						</article>
					</div>
				</section>

				<section className="changelog" id="changelog">
					<div className="section-head">
						<h2>Changelog</h2>
						<a className="text-link" href={GITHUB} target="_blank" rel="noreferrer">
							What’s shipping →
						</a>
					</div>
					<ul>
						{changelog.map(item => (
							<li key={item.title}>
								<time>{item.date}</time>
								<span>{item.title}</span>
							</li>
						))}
					</ul>
				</section>

				<section className="research">
					<p className="research-lead">
						Copix is a free desktop coding agent with a matching CLI — built for builders who want speed without giving up their machine.
					</p>
					<h2>Notes & releases</h2>
					<div className="post-grid">
						{notes.map(p => (
							<a key={p.title} className="post" href={GITHUB} target="_blank" rel="noreferrer">
								<div className="post-meta">
									{p.date} · {p.tag}
								</div>
								<h3>{p.title}</h3>
								<div className="post-by">
									{p.author} · {p.mins} min read
								</div>
							</a>
						))}
					</div>
				</section>

				<section className="closing">
					<h2>Install Copix. Open a folder. Start.</h2>
					<div className="hero-cta">
						<a className="btn primary lg" href={RELEASES} target="_blank" rel="noreferrer">
							Download for desktop
						</a>
						<a className="btn ghost lg" href="#install">
							Install terminal Copix
						</a>
					</div>
				</section>
			</main>

			<footer className="footer">
				<div className="footer-brand">
					<img src={ICON} alt="" width={22} height={22} />
					<span>Copix</span>
				</div>
				<div className="footer-links">
					<a href="#product">Product</a>
					<a href="#changelog">Changelog</a>
					<a href={RELEASES}>Download</a>
					<a href={GITHUB}>GitHub</a>
				</div>
				<p className="footer-copy">© {new Date().getFullYear()} Copix. Fast. Efficient. Precise.</p>
			</footer>
		</div>
	);
}
