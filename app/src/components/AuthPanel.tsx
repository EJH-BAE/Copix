import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { OAuthButtons } from './OAuthButtons';
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
	const [showPassword, setShowPassword] = useState(false);
	const [code, setCode] = useState('');
	const [challengeId, setChallengeId] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const verifyLock = useRef(false);

	useEffect(() => {
		document.title = mode === 'signup' ? 'Sign up · Copix' : 'Sign in · Copix';
	}, [mode]);

	async function submitCredentials(e: FormEvent) {
		e.preventDefault();
		setBusy(true);
		setError('');
		try {
			const res =
				mode === 'signup'
					? await auth.signup(email.trim(), password, name.trim() || undefined)
					: await auth.login(email.trim(), password);
			setChallengeId(res.challengeId || '');
			setCode('');
			setStep('verify');
			verifyLock.current = false;
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	}

	async function verify(e?: FormEvent) {
		e?.preventDefault();
		const trimmed = code.replace(/\D/g, '').slice(0, 6);
		if (trimmed.length !== 6 || busy || verifyLock.current) return;
		verifyLock.current = true;
		setBusy(true);
		setError('');
		try {
			if (mode === 'signup') {
				await auth.verifySignup(email.trim(), trimmed);
			} else {
				await auth.verifyLogin(email.trim(), trimmed, challengeId);
			}
			navigate('/account', { replace: true });
		} catch (err) {
			verifyLock.current = false;
			setError(err instanceof Error ? err.message : String(err));
			setCode('');
		} finally {
			setBusy(false);
		}
	}

	useEffect(() => {
		if (step !== 'verify' || code.length !== 6 || busy || verifyLock.current) return;
		const id = window.setTimeout(() => {
			void verify();
		}, 80);
		return () => window.clearTimeout(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [code, step, busy]);

	async function resend() {
		setBusy(true);
		setError('');
		try {
			const res = await auth.resend2fa(email.trim(), mode === 'signup' ? 'signup' : '2fa');
			if (res.challengeId) setChallengeId(res.challengeId);
			setCode('');
			verifyLock.current = false;
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	}

	const title = mode === 'signup' ? 'Create your Copix account' : 'Sign in to Copix';
	const subtitle =
		step === 'credentials'
			? 'One account for Copix Desktop and CLI.'
			: 'Enter the 6-digit code we sent to your email.';

	return (
		<div className="auth-card">
			<Link to="/" className="auth-brand">
				<img src={`${import.meta.env.BASE_URL}icon.png`} alt="" width={36} height={36} />
				<span>Copix</span>
			</Link>
			<h1>{title}</h1>
			<p className="auth-sub">{subtitle}</p>

			{step === 'credentials' ? (
				<>
					<OAuthButtons next="/account" />

					<div className="auth-divider">
						<span>or email</span>
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
							<span className="auth-password-wrap">
								<input
									type={showPassword ? 'text' : 'password'}
									required
									minLength={8}
									autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
									placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
								<button
									type="button"
									className="auth-eye"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? 'Hide' : 'Show'}
								</button>
							</span>
						</label>
						<button
							className="auth-btn auth-btn-primary"
							disabled={busy || !email || password.length < 8}
							type="submit"
						>
							{busy ? 'Please wait…' : 'Continue'}
						</button>
					</form>
				</>
			) : (
				<form onSubmit={verify} className="auth-form">
					<p className="auth-hint">
						Code sent to <strong>{email}</strong>
					</p>
					<OtpInput value={code} onChange={setCode} disabled={busy} />
					<button
						className="auth-btn auth-btn-primary"
						disabled={busy || code.length !== 6}
						type="submit"
					>
						{busy ? 'Verifying…' : 'Verify & continue'}
					</button>
					<div className="auth-actions">
						<button type="button" className="auth-btn auth-btn-ghost" disabled={busy} onClick={() => void resend()}>
							Resend code
						</button>
						<button
							type="button"
							className="auth-btn auth-btn-ghost"
							disabled={busy}
							onClick={() => {
								setStep('credentials');
								setCode('');
								setChallengeId('');
								setError('');
								verifyLock.current = false;
							}}
						>
							Back
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
