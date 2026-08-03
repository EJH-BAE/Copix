import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { apiBase, apiFetch } from './api';

export type CopixUser = {
	id: string;
	email: string | null;
	name: string;
	avatarUrl: string | null;
	providers: string[];
};

type Providers = { google: boolean; github: boolean; apple: boolean; email: boolean };

type AuthCtx = {
	user: CopixUser | null;
	token: string | null;
	loading: boolean;
	providers: Providers;
	setSession: (token: string, user: CopixUser) => void;
	logout: () => void;
	refresh: () => Promise<void>;
	startEmail: (email: string) => Promise<{ demo?: boolean; demoCode?: string; message: string }>;
	verifyEmail: (email: string, code: string) => Promise<void>;
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
		email: true,
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
			.then(setProviders)
			.catch(() => setProviders({ google: false, github: false, apple: false, email: true }));
		refresh();
	}, [refresh]);

	const startEmail = useCallback(async (email: string) => {
		const data = await apiFetch<{
			ok: boolean;
			demo?: boolean;
			demoCode?: string;
			message: string;
		}>('/auth/email/start', {
			method: 'POST',
			body: JSON.stringify({ email }),
		});
		return data;
	}, []);

	const verifyEmail = useCallback(async (email: string, code: string) => {
		const data = await apiFetch<{ ok: boolean; token: string; user: CopixUser }>('/auth/email/verify', {
			method: 'POST',
			body: JSON.stringify({ email, code }),
		});
		setSession(data.token, data.user);
	}, [setSession]);

	const oauthUrl = useCallback((provider: 'google' | 'github' | 'apple', next = '/app') => {
		return `${apiBase()}/auth/oauth/${provider}?next=${encodeURIComponent(next)}`;
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
			startEmail,
			verifyEmail,
			oauthUrl,
		}),
		[user, token, loading, providers, setSession, logout, refresh, startEmail, verifyEmail, oauthUrl],
	);

	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
	const ctx = useContext(Ctx);
	if (!ctx) throw new Error('useAuth requires AuthProvider');
	return ctx;
}
