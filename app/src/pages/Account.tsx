import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SiteNav } from '../components/SiteNav';
import { useAuth } from '../lib/auth';
import { detectPlatform, RELEASES } from '../lib/platform';

export default function Account() {
	const { user, loading, logout, token } = useAuth();
	const platform = detectPlatform();

	useEffect(() => {
		document.title = 'Account · Copix';
	}, []);

	if (loading) {
		return <div className="auth-page"><p className="auth-sub">Loading…</p></div>;
	}
	if (!user || !token) {
		return <Navigate to="/login" replace />;
	}

	return (
		<div className="page">
			<SiteNav />
			<main className="account">
				<section className="account-card">
					<p className="account-kicker">Signed in</p>
					<h1>Welcome{user.name ? `, ${user.name}` : ''}</h1>
					<p className="account-lead">
						Your Copix account is ready for <strong>Desktop</strong> and <strong>CLI</strong>.
						Download Studio for {platform.osLabel}, then sign in with the same email or provider.
					</p>
					<p className="account-email">{user.email}</p>
					<div className="account-actions">
						<a className="btn primary lg" href={platform.desktopUrl} target="_blank" rel="noreferrer">
							{platform.desktopLabel}
						</a>
						<a className="btn ghost lg" href={RELEASES} target="_blank" rel="noreferrer">
							All releases
						</a>
					</div>
					<ol className="account-steps">
						<li>Install Copix Studio from the download above.</li>
						<li>Open Studio or the CLI and choose Sign in.</li>
						<li>Use Google, GitHub, Apple, or the same email + password.</li>
					</ol>
					<div className="account-footer">
						<Link to="/">Back to home</Link>
						<button type="button" className="linkish" onClick={logout}>Sign out</button>
					</div>
				</section>
			</main>
		</div>
	);
}
