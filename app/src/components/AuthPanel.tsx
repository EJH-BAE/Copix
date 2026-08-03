import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { OtpInput } from './OtpInput';

type Mode = 'signin' | 'signup';

export function AuthPanel({ mode }: { mode: Mode }) {
	const auth = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [code, setCode] = useState('');
	const [step, setStep] = useState<'email' | 'code'>('email');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const [info, setInfo] = useState('');
	const [demoCode, setDemoCode] = useState('');

	async function start(e: FormEvent) {
		e.preventDefault();
		setBusy(true);
		setError('');
		setInfo('');
		setDemoCode('');
		try {
			const res = await auth.startEmail(email);
			setInfo(res.message);
			if (res.demoCode) setDemoCode(res.demoCode);
			setStep('code');
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	}

	async function verify(e: FormEvent) {
		e.preventDefault();
		setBusy(true);
		setError('');
		try {
			await auth.verifyEmail(email, code);
			navigate('/app', { replace: true });
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	}

	const title = mode === 'signup' ? 'Create your Copix account' : 'Welcome back';
	const subtitle = mode === 'signup'
		? 'Sign up free — then run Copix in the browser when you’re logged in.'
		: 'Sign in to open Copix Web, sync history, and continue your agents.';

	return (
		<div className="auth-card">
			<div className="auth-brand">
				<img src={`${import.meta.env.BASE_URL}icon.png`} alt="" width={36} height={36} />
				<span>Copix</span>
			</div>
			<h1>{title}</h1>
			<p className="auth-sub">{subtitle}</p>

			<div className="oauth-row">
				{(['google', 'github', 'apple'] as const).map((p) => {
					const enabled = auth.providers[p];
					const label = p === 'google' ? 'Google' : p === 'github' ? 'GitHub' : 'Apple';
					return (
						<a
							key={p}
							className={`oauth-btn ${enabled ? '' : 'disabled'}`}
							href={enabled ? auth.oauthUrl(p, '/app') : undefined}
							aria-disabled={!enabled}
							onClick={(e) => {
								if (!enabled) {
									e.preventDefault();
									setError(`${label} login isn’t configured yet. Use email code, or set OAuth env vars on the API.`);
								}
							}}
						>
							Continue with {label}
						</a>
					);
				})}
			</div>

			<div className="auth-divider"><span>or email code</span></div>

			{step === 'email' ? (
				<form onSubmit={start} className="auth-form">
					<label>
						Email
						<input
							type="email"
							required
							autoComplete="email"
							placeholder="you@company.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</label>
					<button className="btn primary lg block" disabled={busy} type="submit">
						{busy ? 'Sending…' : 'Send 6-digit code'}
					</button>
				</form>
			) : (
				<form onSubmit={verify} className="auth-form">
					<p className="auth-hint">Code sent to <strong>{email}</strong></p>
					<OtpInput value={code} onChange={setCode} disabled={busy} />
					{demoCode && (
						<p className="auth-demo">
							Dev email preview — your code is <strong>{demoCode}</strong>
						</p>
					)}
					<button className="btn primary lg block" disabled={busy || code.length !== 6} type="submit">
						{busy ? 'Verifying…' : 'Verify & continue'}
					</button>
					<button
						type="button"
						className="btn ghost block"
						onClick={() => { setStep('email'); setCode(''); }}
					>
						Use a different email
					</button>
				</form>
			)}

			{info && <p className="auth-info">{info}</p>}
			{error && <p className="auth-error">{error}</p>}

			<p className="auth-switch">
				{mode === 'signup' ? (
					<>Already have an account? <Link to="/login">Sign in</Link></>
				) : (
					<>New here? <Link to="/signup">Create an account</Link></>
				)}
			</p>
			<p className="auth-legal">
				By continuing you agree that Copix is free to use and proprietary (not open source).
			</p>
		</div>
	);
}
