import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,

        hmr: {
            protocol: 'ws',
            host: 'localhost',
            clientPort: 5173,
        },

        watch: {
            usePolling: true,
            interval: 500,
            ignored: [
                '**/.git/**',
                '**/.env',
                '**/.env.*',
                '**/vendor/**',
                '**/storage/**',
                '**/bootstrap/cache/**',
                '**/node_modules/**',
                '**/public/build/**',
                '**/public/hot',
            ],
        },
    },

    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: [
                'app/**/*.php',
                'routes/**/*.php',
                'resources/views/**/*.php',
            ],
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),

        inertia(),

        react(),

        tailwindcss(),

        wayfinder({
            formVariants: true,
            command: '/usr/bin/php84 artisan wayfinder:generate --with-form',
        }),
    ],
});