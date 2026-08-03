const DEFAULT_API = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export function apiBase() {
	return String(DEFAULT_API).replace(/\/$/, '');
}

export async function apiFetch<T = unknown>(
	path: string,
	opts: RequestInit & { token?: string | null } = {},
): Promise<T> {
	const headers = new Headers(opts.headers || {});
	if (!headers.has('Content-Type') && opts.body) headers.set('Content-Type', 'application/json');
	if (opts.token) headers.set('Authorization', `Bearer ${opts.token}`);
	const res = await fetch(`${apiBase()}${path}`, { ...opts, headers });
	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
	}
	return data as T;
}
