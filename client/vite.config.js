import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
// https://vitejs.dev/config/
export default defineConfig({
    // Pin the project root to this folder so the dev server serves the client
    // correctly even when launched from a different working directory.
    root: path.resolve(__dirname),
    plugins: [
        react(),
        // Installable PWA (mobile-first): manifest + auto-updating service worker.
        VitePWA({
            registerType: 'autoUpdate',
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            includeAssets: ['favicon.svg'],
            manifest: {
                name: 'Estada — Verified Property in Pakistan',
                short_name: 'Estada',
                description: 'Find verified houses, plots, flats and commercial property across Pakistan.',
                theme_color: '#0F2A47',
                background_color: '#FAFAF8',
                display: 'standalone',
                start_url: '/',
                icons: [
                    { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
                    { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
                ],
            },
            injectManifest: {
                // App shell only — never precache API/uploads responses.
                globPatterns: ['**/*.{js,css,html,svg,woff2}'],
            },
            devOptions: { enabled: true, type: 'module' },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        // Ensure a single React instance (guards against "Invalid hook call").
        dedupe: ['react', 'react-dom'],
    },
    server: {
        port: 5176,
        // Proxy API calls to the Express server in dev so cookies stay same-origin.
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            // Locally-stored uploads are served by the API in dev.
            '/uploads': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            // Socket.IO real-time chat (WebSocket).
            '/socket.io': {
                target: 'http://localhost:5000',
                ws: true,
                changeOrigin: true,
            },
        },
    },
});
