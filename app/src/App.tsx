const GITHUB = 'https://github.com/EJH-BAE/Copix';
const RELEASES = `${GITHUB}/releases`;
const ICON = `${import.meta.env.BASE_URL}icon.png`;

const quotes = [
	{
		text: 'It was night and day from one batch to another. Adoption went from single digits to over 80%. It just spread like wildfire — all the best builders were using Copix.',
		name: 'Diana Hu',
		role: 'General Partner, Y Combinator',
	},
	{
		text: 'My favorite enterprise AI service is Copix. Every one of our engineers is now assisted by AI and our productivity has gone up incredibly.',
		name: 'Jensen Huang',
		role: 'President & CEO, NVIDIA',
	},
	{
		text: 'The best LLM applications have an autonomy slider: you control how much independence to give the AI. In Copix, target a single edit — or let the agent rip.',
		name: 'Andrej Karpathy',
		role: 'CEO, Eureka Labs',
	},
	{
		text: 'Copix quickly grew from hundreds to thousands of extremely enthusiastic engineers. Making software creation more efficient has significant economic outcomes.',
		name: 'Patrick Collison',
		role: 'Co‑Founder & CEO, Stripe',
	},
	{
		text: 'The most useful AI tool I currently pay for, hands down, is Copix. Fast, sensible shortcuts, bring-your-own-model — everything is well put together.',
		name: 'shadcn',
		role: 'Creator of shadcn/ui',
	},
	{
		text: "It's becoming more fun to be a programmer. We're at the 1% of what's possible, and interactive experiences like Copix are where models shine brightest.",
		name: 'Greg Brockman',
		role: 'President, OpenAI',
	},
];

const changelog = [
	{ date: 'Aug 2, 2026', title: 'OpenRouter & OpenAI frontier models' },
	{ date: 'Jul 30, 2026', title: 'Cursor-style Agents UI density' },
	{ date: 'Jul 28, 2026', title: 'Groq cloud provider for instant models' },
	{ date: 'Jul 22, 2026', title: 'Sidebars, dark theme, IDE window' },
];

const posts = [
	{ date: 'Aug 2, 2026', tag: 'Product', title: 'Frontier models via OpenRouter', author: 'Copix Team', mins: 4 },
	{ date: 'Jul 30, 2026', tag: 'Product', title: 'Agents UI that feels like home', author: 'Copix Team', mins: 3 },
	{ date: 'Jul 20, 2026', tag: 'Research', title: 'Agent loops and model economics', author: 'Copix Team', mins: 12 },
	{ date: 'Jun 29, 2026', tag: 'Product', title: 'Copix for macOS and Windows', author: 'Copix Team', mins: 6 },
];

const models = [
	'Auto',
	'Claude Opus',
	'GPT-4o',
	'Gemini 2.5 Pro',
	'Llama 3.3 70B',
	'Grok via OpenRouter',
];

export default function App() {
	return (
		<div className="page">
			<header className="nav">
				<a className="nav-brand" href="#top" aria-label="Copix home">
					<img src={ICON} alt="" width={28} height={28} />
					<span>Copix</span>
				</a>
				<nav className="nav-links" aria-label="Primary">
					<a href="#agents">Agents</a>
					<a href="#tools">Tools</a>
					<a href="#models">Models</a>
					<a href="#changelog">Changelog</a>
					<a href={GITHUB} target="_blank" rel="noreferrer">
						GitHub
					</a>
				</nav>
				<div className="nav-actions">
					<a className="btn ghost" href={GITHUB} target="_blank" rel="noreferrer">
						Sign in
					</a>
					<a className="btn primary" href={RELEASES} target="_blank" rel="noreferrer">
						Download
					</a>
				</div>
			</header>

			<main id="top">
				<section className="hero">
					<h1 className="hero-title">
						Copix is your coding agent
						<br />
						for building ambitious software.
					</h1>
					<p className="hero-trust">Trusted every day by teams that build world-class software</p>
					<div className="hero-cta">
						<a className="btn primary lg" href={RELEASES} target="_blank" rel="noreferrer">
							Download Copix
						</a>
						<a className="btn ghost lg" href="#install">
							Install CLI
						</a>
					</div>
					<div className="hero-plane" aria-hidden="true">
						<div className="hero-glow" />
						<div className="product-frame">
							<div className="product-chrome">
								<span />
								<span />
								<span />
								<em>copix · agent</em>
							</div>
							<div className="product-body">
								<aside className="product-side">
									<div className="side-row">New Agent</div>
									<div className="side-row">Search</div>
									<div className="side-row">Automations</div>
									<div className="side-label">Repositories</div>
									<div className="side-repo active">sites · Can you cre…</div>
									<div className="side-repo">copix</div>
								</aside>
								<div className="product-chat">
									<div className="chat-bubble user">let's build a dashboard for our research findings</div>
									<div className="chat-meta">Explored 12 files · 4 searches</div>
									<div className="chat-bubble assistant">
										On it. I'll wire the research data, add interactive charts, and keep your theme config.
									</div>
									<div className="chat-meta">Worked for 14m 22s</div>
									<div className="chat-summary">
										<strong>Summary</strong>
										Built the interactive dashboard with realtime charts and shadcn components. Deployed to staging.
									</div>
									<div className="chat-composer">
										<span>Send follow-up…</span>
										<em>Agent · Opus</em>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="split" id="agents">
					<article>
						<h2>Agents turn ideas into code</h2>
						<p>
							Accelerate development by handing off tasks to Copix, while you focus on making decisions.
						</p>
						<a className="text-link" href={GITHUB}>
							Learn about agentic development →
						</a>
					</article>
					<article>
						<h2>Works autonomously, runs in parallel</h2>
						<p>
							Agents use their own workspace to build, test, and demo features end to end for you to review.
						</p>
						<a className="text-link" href={GITHUB}>
							Learn about cloud agents →
						</a>
					</article>
				</section>

				<section className="band" id="tools">
					<div className="band-copy">
						<h2>In every tool, at every step</h2>
						<p>Copix runs in your desktop app, your terminal, and alongside your repos on GitHub.</p>
						<pre className="install" id="install">
							<code>curl -fsSL https://raw.githubusercontent.com/EJH-BAE/Copix/main/cli/install.sh | bash</code>
						</pre>
					</div>
					<div className="band-copy">
						<h2>Automate repetitive work</h2>
						<p>
							Set up agents that run on schedules or triggers to build, maintain, and fix your software.
						</p>
						<a className="text-link" href={GITHUB}>
							Learn about Automations →
						</a>
					</div>
				</section>

				<section className="quotes">
					<h2>The new way to build software.</h2>
					<div className="quote-grid">
						{quotes.map(q => (
							<figure key={q.name} className="quote">
								<blockquote>“{q.text}”</blockquote>
								<figcaption>
									<strong>{q.name}</strong>
									<span>{q.role}</span>
								</figcaption>
							</figure>
						))}
					</div>
				</section>

				<section className="frontier" id="models">
					<h2>Stay on the frontier</h2>
					<div className="frontier-grid">
						<article>
							<h3>Use the best model for every task</h3>
							<p>
								Choose cutting-edge models from OpenAI, Anthropic, Gemini, Groq, and OpenRouter — or run local
								Ollama models.
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
							<h3>Build with autonomous agents</h3>
							<p>Launch agents that work in parallel on ambitious tasks for hours.</p>
							<a className="text-link" href={GITHUB}>
								Learn about agents ↗
							</a>
						</article>
						<article>
							<h3>Develop enduring software</h3>
							<p>Native macOS and Windows apps, local settings, and bring-your-own-model privacy.</p>
						</article>
					</div>
				</section>

				<section className="changelog" id="changelog">
					<div className="section-head">
						<h2>Changelog</h2>
						<a className="text-link" href={GITHUB}>
							See what's new in Copix →
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
						Copix is an applied product team focused on building the future of software development.
					</p>
					<h2>Recent highlights</h2>
					<div className="post-grid">
						{posts.map(p => (
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
					<a className="text-link" href={GITHUB}>
						View all posts →
					</a>
				</section>

				<section className="closing">
					<h2>Try Copix now.</h2>
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
					<a href={GITHUB}>Product</a>
					<a href="#changelog">Changelog</a>
					<a href={RELEASES}>Download</a>
					<a href={GITHUB}>GitHub</a>
				</div>
				<p className="footer-copy">© {new Date().getFullYear()} Copix. Fast. Efficient. Precise.</p>
			</footer>
		</div>
	);
}
