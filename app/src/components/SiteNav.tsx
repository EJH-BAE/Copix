import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const ICON = `${import.meta.env.BASE_URL}icon.png`;

export function SiteNav() {
	const { user, logout } = useAuth();
	return (
		<header className="nav">
			<Link className="nav-brand" to="/" aria-label="Copix home">
				<img src={ICON} alt="" width={28} height={28} />
				<span>Copix</span>
			</Link>
			<nav className="nav-links" aria-label="Primary">
				<a href="#product">Product</a>
				<a href="#demo">Demo</a>
				<a href="#install">Install</a>
				<a href="#models">Models</a>
			</nav>
			<div className="nav-actions">
				{user ? (
					<>
						<Link className="btn ghost" to="/app">Open Copix Web</Link>
						<button type="button" className="btn ghost" onClick={logout}>Sign out</button>
					</>
				) : (
					<>
						<Link className="btn ghost" to="/login">Sign in</Link>
						<Link className="btn primary" to="/signup">Sign up</Link>
					</>
				)}
			</div>
		</header>
	);
}
