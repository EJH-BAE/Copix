import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	base: process.env.GITHUB_PAGES === 'true' ? '/Copix/' : '/',
	server: {
		host: true,
		port: 5173,
		strictPort: false,
	},
	preview: {
		port: 4173,
	},
});
