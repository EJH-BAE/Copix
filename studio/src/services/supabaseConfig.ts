/**
 * Copix cloud backend (Supabase).
 * Anon key is safe to ship in the client when RLS is enabled — never put service_role here.
 */
export const COPIX_SUPABASE_URL = 'https://vifdyvcxhfqmcrmrtkwp.supabase.co';
export const COPIX_SUPABASE_ANON_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpZmR5dmN4aGZxbWNybXJ0a3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NDUzNDQsImV4cCI6MjA5OTMyMTM0NH0.kM6vUmh4sJxXwVB4-5Gh4WWGOHfC9zIzBT4oRsHScpI';

/** Normalize pasted URLs that include /rest/v1/ or trailing slashes. */
export function normalizeSupabaseUrl(url: string): string {
	return url
		.trim()
		.replace(/\/+$/, '')
		.replace(/\/rest\/v1$/i, '');
}
