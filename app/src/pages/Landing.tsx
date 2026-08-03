import { Link } from 'react-router-dom';
import { InteractiveDemo } from '../components/InteractiveDemo';
import { SiteNav } from '../components/SiteNav';
import { useAuth } from '../lib/auth';

const GITHUB = 'https://github.com/EJH-BAE/Copix';
const RELEASES = `${GITHUB}/releases`;
const INSTALL = 'curl -fsSL https://raw.githubusercontent.com/EJH-BAE/Copix/main/cli/install.sh | bash';

const pillars = [
	{
		title: 'Desktop, CLI, and Web',
		body: 'One agent brain across Copix Studio, the terminal CLI, and Copix Web when you’re signed in.',
	},
	{
		title: 'Local models + cloud login',
		body: 'Keep Ollama on your machine. Use your Copix account for web access, sync, and team-ready identity.',
	},
	{
		title: 'Tools that ship work',
		body: 'create_project, edit_file, terminal, web_search, web_fetch — the agent touches real files and the public web.',
	},
];

const models = ['qwen2.5:3b', 'qwen2.5-coder:7b', 'mistral:7b', 'qwen3.5:4b', 'Auto'];

export default function Landing() {
	const { user } = useAuth();

	return (
		<div className="page">
			<SiteNav />
			<main id="top">
				<section className="hero hero-split">
					<div className="hero-copy">
						<p className="hero-kicker">The AI coding product</p>
						<h1 className="hero-title">
							Build software
							<br />
							<span className="hero-grad">with Copix.</span>
						</h1>
						<p className="hero-trust">
							Fast. Efficient. Precise. Sign in to run Copix in the browser — or download Studio and the CLI for your machine.
						</p>
						<div className="hero-cta">
							{user ? (
								<Link className="btn primary lg" to="/app">Open Copix Web</Link>
							) : (
								<Link className="btn primary lg" to="/signup">Get started free</Link>
							)}
							<a className="btn ghost lg" href={RELEASES} target="_blank" rel="noreferrer">
								Download desktop
							</a>
						</div>
						<p className="hero-meta">Google · GitHub · Apple · email code · proprietary · free to use</p>
					</div>
					<div className="hero-stage" id="demo">
						<InteractiveDemo />
					</div>
				</section>

				<section className="logos-strip" aria-label="Works with">
					<span>Ollama</span>
					<span>macOS</span>
					<span>Windows</span>
					<span>CLI</span>
					<span>Web</span>
				</section>

				<section className="product" id="product">
					<div className="section-head">
						<h2>One product. Every surface.</h2>
						<p>Interact with the agent in Studio, in your terminal, or in Copix Web after you sign in.</p>
					</div>
					<div className="pillar-grid">
						{pillars.map((p) => (
							<article key={p.title} className="pillar">
								<h3>{p.title}</h3>
								<p>{p.body}</p>
							</article>
						))}
					</div>
				</section>

				<section className="install" id="install">
					<div className="section-head">
						<h2>Install anywhere</h2>
						<p>Desktop builds, a one-line CLI install, and Copix Web for signed-in sessions.</p>
					</div>
					<div className="install-grid">
						<div className="install-card">
							<h3>Copix Web</h3>
							<p>Log in with Google, GitHub, Apple, or a 6-digit email code — then chat with your agent in the browser.</p>
							<Link className="btn primary" to={user ? '/app' : '/signup'}>
								{user ? 'Open web app' : 'Create account'}
							</Link>
						</div>
						<div className="install-card">
							<h3>Desktop</h3>
							<p>Native Studio for macOS and Windows with the full tool surface.</p>
							<a className="btn ghost" href={RELEASES} target="_blank" rel="noreferrer">Download</a>
						</div>
						<div className="install-card wide">
							<h3>CLI</h3>
							<pre><code>{INSTALL}</code></pre>
						</div>
					</div>
				</section>

				<section className="models" id="models">
					<div className="section-head">
						<h2>Bring your models</h2>
						<p>Ollama-first defaults. Stretch tags when you pull them. Web sessions use your connected endpoint.</p>
					</div>
					<div className="model-row">
						{models.map((m) => <span key={m} className="model-chip">{m}</span>)}
					</div>
				</section>

				<section className="closing">
					<h2>Sign in. Build something.</h2>
					<div className="hero-cta">
						<Link className="btn primary lg" to={user ? '/app' : '/signup'}>
							{user ? 'Continue to Copix Web' : 'Sign up free'}
						</Link>
						<Link className="btn ghost lg" to="/login">I already have an account</Link>
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
					<a href={RELEASES}>Download</a>
					<a href={GITHUB}>GitHub</a>
					<Link to="/login">Sign in</Link>
				</div>
				<p className="footer-copy">© {new Date().getFullYear()} Copix. Free to use · proprietary · not open source.</p>
			</footer>
		</div>
	);
}
