import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth, type CopixUser } from '../lib/auth';

export default function AuthCallback() {
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const { setSession } = useAuth();
	const [error, setError] = useState('');

	useEffect(() => {
		const token = params.get('token');
		const next = params.get('next') || '/app';
		if (!token) {
			setError('Missing session token from provider.');
			return;
		}
		apiFetch<{ ok: boolean; user: CopixUser }>('/auth/me', { token })
			.then((data) => {
				setSession(token, data.user);
				navigate(next.startsWith('/') ? next : '/app', { replace: true });
			})
			.catch((err) => setError(err instanceof Error ? err.message : String(err)));
	}, [params, setSession, navigate]);

	return (
		<div className="auth-page">
			<div className="auth-card">
				<h1>Finishing sign-in…</h1>
				{error ? <p className="auth-error">{error}</p> : <p className="auth-sub">Connecting your Copix account.</p>}
			</div>
		</div>
	);
}
