/** Absolute API origin for OAuth redirects (always a full URL). */
export function apiOrigin() {
	const fromEnv = import.meta.env.VITE_API_URL;
	if (fromEnv) return String(fromEnv).replace(/\/$/, '');
	return 'http://127.0.0.1:8787';
}

/**
 * Base for XHR/fetch.
 * - If VITE_API_URL is set → use it (GitHub Pages / remote API)
 * - In Vite DEV without env → same-origin (proxied to the API)
 * - Otherwise → local API
 */
export function apiBase() {
	const fromEnv = import.meta.env.VITE_API_URL;
	if (fromEnv) return String(fromEnv).replace(/\/$/, '');
	if (import.meta.env.DEV) return '';
	return apiOrigin();
}

function networkError(): Error {
	return new Error(
		'Cannot reach the Copix API. In one terminal run: cd api && npm run dev',
	);
}

export async function apiFetch<T = unknown>(
	path: string,
	opts: RequestInit & { token?: string | null } = {},
): Promise<T> {
	const headers = new Headers(opts.headers || {});
	if (!headers.has('Content-Type') && opts.body) headers.set('Content-Type', 'application/json');
	if (opts.token) headers.set('Authorization', `Bearer ${opts.token}`);

	let res: Response;
	try {
		res = await fetch(`${apiBase()}${path}`, { ...opts, headers });
	} catch {
		throw networkError();
	}

	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
	}
	return data as T;
}
