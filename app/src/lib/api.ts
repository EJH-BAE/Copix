/** Absolute API origin for OAuth redirects (always a full URL). */
export function apiOrigin() {
	const fromEnv = import.meta.env.VITE_API_URL;
	if (fromEnv) return String(fromEnv).replace(/\/$/, '');
	return 'http://127.0.0.1:8787';
}

/**
 * Base for XHR/fetch.
 * - If VITE_API_URL is set → use it (GitHub Pages / remote API)
 * - In Vite DEV/preview without env → same-origin (proxied to the API)
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

export type StreamHandlers = {
	onDelta?: (text: string) => void;
	onStatus?: (message: string) => void;
	onDone?: (payload: unknown) => void;
	onError?: (message: string) => void;
};

/** Consume Copix agent SSE (`event: delta|status|done`). */
export async function apiStream(
	path: string,
	opts: RequestInit & { token?: string | null },
	handlers: StreamHandlers,
): Promise<void> {
	const headers = new Headers(opts.headers || {});
	if (!headers.has('Content-Type') && opts.body) headers.set('Content-Type', 'application/json');
	if (opts.token) headers.set('Authorization', `Bearer ${opts.token}`);

	let res: Response;
	try {
		res = await fetch(`${apiBase()}${path}`, { ...opts, headers });
	} catch {
		throw networkError();
	}

	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
	}
	if (!res.body) throw new Error('No stream body from API');

	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buf = '';
	let event = 'message';

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buf += decoder.decode(value, { stream: true });
		const chunks = buf.split('\n');
		buf = chunks.pop() || '';
		for (const raw of chunks) {
			const line = raw.replace(/\r$/, '');
			if (!line) continue;
			if (line.startsWith('event:')) {
				event = line.slice(6).trim();
				continue;
			}
			if (!line.startsWith('data:')) continue;
			const payload = line.slice(5).trim();
			let data: Record<string, unknown> = {};
			try {
				data = JSON.parse(payload);
			} catch {
				continue;
			}
			if (event === 'delta' && typeof data.text === 'string') handlers.onDelta?.(data.text);
			else if (event === 'status') handlers.onStatus?.(String(data.message || ''));
			else if (event === 'done') handlers.onDone?.(data);
			else if (event === 'error') handlers.onError?.(String(data.error || 'Stream error'));
		}
	}
}
