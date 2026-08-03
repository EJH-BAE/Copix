import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = process.env.VITE_API_PROXY || 'http://127.0.0.1:8787';

export default defineConfig({
	plugins: [react()],
	base: process.env.GITHUB_PAGES === 'true' ? '/Copix/' : '/',
	server: {
		host: true,
		port: 5173,
		strictPort: false,
		proxy: {
			'/health': { target: apiTarget, changeOrigin: true },
			'/auth': { target: apiTarget, changeOrigin: true },
		},
	},
	preview: {
		port: 4173,
		proxy: {
			'/health': { target: apiTarget, changeOrigin: true },
			'/auth': { target: apiTarget, changeOrigin: true },
		},
	},
});

