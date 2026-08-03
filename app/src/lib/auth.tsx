import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { apiFetch, apiOrigin } from './api';

export type CopixUser = {
	id: string;
	email: string | null;
	name: string;
	avatarUrl: string | null;
	providers: string[];
	hasPassword?: boolean;
};

type Providers = {
	google: boolean;
	github: boolean;
	apple: boolean;
	password: boolean;
	twoFactor: boolean;
};

type CredResult = {
	ok: boolean;
	step: '2fa';
	email: string;
	challengeId?: string;
	demo?: boolean;
	demoCode?: string;
	message: string;
};

type AuthCtx = {
	user: CopixUser | null;
	token: string | null;
	loading: boolean;
	providers: Providers;
	setSession: (token: string, user: CopixUser) => void;
	logout: () => void;
	refresh: () => Promise<void>;
	signup: (email: string, password: string, name?: string) => Promise<CredResult>;
	login: (email: string, password: string) => Promise<CredResult>;
	verifySignup: (email: string, code: string) => Promise<void>;
	verifyLogin: (email: string, code: string, challengeId: string) => Promise<void>;
	resend2fa: (email: string, purpose: 'signup' | '2fa') => Promise<CredResult>;
	oauthUrl: (provider: 'google' | 'github' | 'apple', next?: string) => string;
};

const Ctx = createContext<AuthCtx | null>(null);
const TOKEN_KEY = 'copix.web.token';

export function AuthProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
	const [user, setUser] = useState<CopixUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [providers, setProviders] = useState<Providers>({
		google: false,
		github: false,
		apple: false,
		password: true,
		twoFactor: true,
	});

	const setSession = useCallback((nextToken: string, nextUser: CopixUser) => {
		localStorage.setItem(TOKEN_KEY, nextToken);
		setToken(nextToken);
		setUser(nextUser);
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem(TOKEN_KEY);
		setToken(null);
		setUser(null);
	}, []);

	const refresh = useCallback(async () => {
		const t = localStorage.getItem(TOKEN_KEY);
		if (!t) {
			setUser(null);
			setLoading(false);
			return;
		}
		try {
			const data = await apiFetch<{ ok: boolean; user: CopixUser }>('/auth/me', { token: t });
			setToken(t);
			setUser(data.user);
		} catch {
			localStorage.removeItem(TOKEN_KEY);
			setToken(null);
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		apiFetch<Providers>('/auth/providers')
			.then((p) =>
				setProviders({
					google: Boolean(p.google),
					github: Boolean(p.github),
					apple: Boolean(p.apple),
					password: p.password !== false,
					twoFactor: p.twoFactor !== false,
				}),
			)
			.catch(() =>
				setProviders({
					google: false,
					github: false,
					apple: false,
					password: true,
					twoFactor: true,
				}),
			);
		refresh();
	}, [refresh]);

	const signup = useCallback(async (email: string, password: string, name?: string) => {
		return apiFetch<CredResult>('/auth/signup', {
			method: 'POST',
			body: JSON.stringify({ email, password, name }),
		});
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		return apiFetch<CredResult>('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		});
	}, []);

	const verifySignup = useCallback(
		async (email: string, code: string) => {
			const data = await apiFetch<{ ok: boolean; token: string; user: CopixUser }>(
				'/auth/signup/verify',
				{
					method: 'POST',
					body: JSON.stringify({ email, code }),
				},
			);
			setSession(data.token, data.user);
		},
		[setSession],
	);

	const verifyLogin = useCallback(
		async (email: string, code: string, challengeId: string) => {
			const data = await apiFetch<{ ok: boolean; token: string; user: CopixUser }>(
				'/auth/login/verify',
				{
					method: 'POST',
					body: JSON.stringify({ email, code, challengeId }),
				},
			);
			setSession(data.token, data.user);
		},
		[setSession],
	);

	const resend2fa = useCallback(async (email: string, purpose: 'signup' | '2fa') => {
		return apiFetch<CredResult>('/auth/2fa/resend', {
			method: 'POST',
			body: JSON.stringify({ email, purpose }),
		});
	}, []);

	const oauthUrl = useCallback((provider: 'google' | 'github' | 'apple', next = '/account') => {
		// OAuth must hit the API origin directly (not the Vite proxy).
		return `${apiOrigin()}/auth/oauth/${provider}?next=${encodeURIComponent(next)}`;
	}, []);

	const value = useMemo(
		() => ({
			user,
			token,
			loading,
			providers,
			setSession,
			logout,
			refresh,
			signup,
			login,
			verifySignup,
			verifyLogin,
			resend2fa,
			oauthUrl,
		}),
		[
			user,
			token,
			loading,
			providers,
			setSession,
			logout,
			refresh,
			signup,
			login,
			verifySignup,
			verifyLogin,
			resend2fa,
			oauthUrl,
		],
	);

	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
	const ctx = useContext(Ctx);
	if (!ctx) throw new Error('useAuth requires AuthProvider');
	return ctx;
}
