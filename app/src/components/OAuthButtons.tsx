import { useAuth } from '../lib/auth';

const providers = [
	{
		id: 'google' as const,
		label: 'Google',
		icon: (
			<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
				<path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9A6.4 6.4 0 1 1 12 5.6c1.8 0 3 .8 3.7 1.4l2.5-2.4A10.3 10.3 0 0 0 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z" />
				<path fill="#34A853" d="M3.9 7.3A10 10 0 0 0 2 12c0 1.7.4 3.3 1.2 4.7l3.5-2.7A6 6 0 0 1 6 12c0-.9.2-1.7.5-2.5L3.9 7.3z" />
				<path fill="#FBBC05" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.9 7.3l2.6 2.2C7.3 7.6 9.4 6 12 6z" />
				<path fill="#4285F4" d="M12 18a6 6 0 0 1-5.3-3.3l-3.5 2.7A10 10 0 0 0 12 22c2.7 0 5-.9 6.7-2.5l-3.3-2.5c-.9.6-2 1-3.4 1z" />
			</svg>
		),
	},
	{
		id: 'github' as const,
		label: 'GitHub',
		icon: (
			<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
				<path
					fill="currentColor"
					d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.6s.8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1a3.6 3.6 0 0 1 .1 2.6 3.9 3.9 0 0 1 1 2.7c0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z"
				/>
			</svg>
		),
	},
	{
		id: 'apple' as const,
		label: 'Apple',
		icon: (
			<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
				<path
					fill="currentColor"
					d="M16.7 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.8 2.1 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7c1.2 0 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.2-2.4-.1 0-2.2-.8-2.2-3.7zm-2-6.3c.6-.8 1.1-1.8.9-2.9-1 .1-2.1.6-2.7 1.4-.6.7-1.1 1.8-.9 2.8 1.1.1 2.1-.5 2.7-1.3z"
				/>
			</svg>
		),
	},
];

export function OAuthButtons({ next = '/account' }: { next?: string }) {
	const auth = useAuth();

	return (
		<div className="oauth-row">
			{providers.map((p) => (
				<a key={p.id} className="oauth-btn" href={auth.oauthUrl(p.id, next)}>
					<span className="oauth-icon">{p.icon}</span>
					<span>Continue with {p.label}</span>
				</a>
			))}
		</div>
	);
}
