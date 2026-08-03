/** Scroll to a hash target after client-side navigation (sticky nav aware). */
export function scrollToHash(hash: string, behavior: ScrollBehavior = 'smooth') {
	const id = hash.replace(/^#/, '');
	if (!id) return;
	const el = document.getElementById(id);
	if (el) el.scrollIntoView({ behavior, block: 'start' });
}
