import { Link } from 'react-router-dom';

const ICON = `${import.meta.env.BASE_URL}icon.png`;

export function SiteNav() {
	return (
		<header className="nav">
			<Link className="nav-brand" to="/" aria-label="Copix home">
				<img src={ICON} alt="" width={28} height={28} />
				<span>Copix</span>
			</Link>
			<nav className="nav-links" aria-label="Primary">
				<Link to={{ pathname: '/', hash: 'product' }}>Product</Link>
				<Link to={{ pathname: '/', hash: 'demo' }}>Demo</Link>
				<Link to={{ pathname: '/', hash: 'install' }}>Install</Link>
				<Link to={{ pathname: '/', hash: 'cli' }}>CLI</Link>
			</nav>
			<div className="nav-actions">
				<a className="btn ghost" href="#install">Desktop</a>
				<a className="btn primary" href="#cli">Get CLI</a>
			</div>
		</header>
	);
}
