import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { OtpInput } from './OtpInput';

type Mode = 'signin' | 'signup';
type Step = 'credentials' | 'verify';

export function AuthPanel({ mode }: { mode: Mode }) {
	const auth = useAuth();
	const navigate = useNavigate();
	const [step, setStep] = useState<Step>('credentials');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [code, setCode] = useState('');
	const [challengeId, setChallengeId] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const [info, setInfo] = useState('');
	const [demoCode, setDemoCode] = useState('');

	async function submitCredentials(e: FormEvent) {
		e.preventDefault();
		setBusy(true);
		setError('');
		setInfo('');
		setDemoCode('');
		try {
			const res =
				mode === 'signup'
					? await auth.signup(email.trim(), password, name.trim() || undefined)
					: await auth.login(email.trim(), password);
			setChallengeId(res.challengeId || '');
			setInfo(res.message);
			if (res.demoCode) setDemoCode(res.demoCode);
			setCode('');
			setStep('verify');
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	}

	async function verify(e?: FormEvent) {
		e?.preventDefault();
		if (code.length !== 6 || busy) return;
		setBusy(true);
		setError('');
		try {
			if (mode === 'signup') {
				await auth.verifySignup(email.trim(), code);
			} else {
				await auth.verifyLogin(email.trim(), code, challengeId);
			}
			navigate('/app', { replace: true });
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
			setCode('');
		} finally {
			setBusy(false);
		}
	}

	useEffect(() => {
		if (step === 'verify' && code.length === 6 && !busy) {
			void verify();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [code, step]);

	async function resend() {
		setBusy(true);
		setError('');
		try {
			const res = await auth.resend2fa(email.trim(), mode === 'signup' ? 'signup' : '2fa');
			if (res.challengeId) setChallengeId(res.challengeId);
			setInfo(res.message);
			if (res.demoCode) setDemoCode(res.demoCode);
			setCode('');
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	}

	const title = mode === 'signup' ? 'Create your Copix account' : 'Sign in to Copix';
	const subtitle =
		step === 'credentials'
			? mode === 'signup'
				? 'Password first — then a 6-digit email code as the second step.'
				: 'Enter your email and password. We’ll email a 6-digit code for 2FA.'
			: 'Second step: enter the 6-digit code we sent to your email.';

	return (
		<div className="auth-card">
			<div className="auth-brand">
				<img src={`${import.meta.env.BASE_URL}icon.png`} alt="" width={36} height={36} />
				<span>Copix</span>
			</div>
			<h1>{title}</h1>
			<p className="auth-sub">{subtitle}</p>

			{step === 'credentials' ? (
				<>
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
											setError(
												`${label} login isn’t configured yet. Use email + password, or set OAuth env vars on the API.`,
											);
										}
									}}
								>
									Continue with {label}
								</a>
							);
						})}
					</div>

					<div className="auth-divider">
						<span>or email + password</span>
					</div>

					<form onSubmit={submitCredentials} className="auth-form">
						{mode === 'signup' ? (
							<label>
								Name
								<input
									type="text"
									autoComplete="name"
									placeholder="Optional"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</label>
						) : null}
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
						<label>
							Password
							<input
								type="password"
								required
								minLength={8}
								autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
								placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</label>
						<button
							className="btn primary lg auth-submit"
							disabled={busy || !email || password.length < 8}
							type="submit"
						>
							{busy ? 'Please wait…' : mode === 'signup' ? 'Continue' : 'Continue'}
						</button>
					</form>
				</>
			) : (
				<form onSubmit={verify} className="auth-form">
					<p className="auth-hint">
						Code sent to <strong>{email}</strong>
					</p>
					<OtpInput value={code} onChange={setCode} disabled={busy} />
					{demoCode ? (
						<p className="auth-demo">
							Dev email preview — your code is <strong>{demoCode}</strong>
						</p>
					) : null}
					{info ? <p className="auth-info">{info}</p> : null}
					<button
						className="btn primary lg auth-submit"
						disabled={busy || code.length !== 6}
						type="submit"
					>
						{busy ? 'Verifying…' : 'Verify & continue'}
					</button>
					<div className="auth-actions">
						<button type="button" className="btn ghost auth-submit" disabled={busy} onClick={() => void resend()}>
							Resend code
						</button>
						<button
							type="button"
							className="btn ghost auth-submit"
							disabled={busy}
							onClick={() => {
								setStep('credentials');
								setCode('');
								setChallengeId('');
								setDemoCode('');
								setInfo('');
								setError('');
							}}
						>
							Back to password
						</button>
					</div>
				</form>
			)}

			{error ? <p className="auth-error">{error}</p> : null}

			<p className="auth-switch">
				{mode === 'signup' ? (
					<>
						Already have an account? <Link to="/login">Sign in</Link>
					</>
				) : (
					<>
						New here? <Link to="/signup">Create an account</Link>
					</>
				)}
			</p>
			<p className="auth-legal">
				By continuing you agree that Copix is free to use and proprietary (not open source).
			</p>
		</div>
	);
}
