import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  define: {
    // Expose SENTRY_DSN (Railway var name) to the client bundle at build time
    'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(process.env.SENTRY_DSN || ''),
  },
});
