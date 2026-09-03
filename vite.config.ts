import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    // Assets stay hashed; the fonts in public/ keep stable paths so index.html
    // can preload them without a manifest lookup.
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    proxy: {
      // npm run mock serves the local mock webhook on 8787. With no
      // VITE_LEAD_WEBHOOK_URL set, the form posts to /api/lead, which lands here
      // in dev. This is how the payload shape is verified without a real n8n.
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
});
