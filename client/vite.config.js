import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Proxy uploaded product images to the Express static handler.
      // In production these will be Vercel Blob CDN URLs so no proxy needed.
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals:     true,
    environment: 'happy-dom',
    setupFiles:  ['./src/__tests__/setup.js'],
    include:     ['src/__tests__/**/*.test.{js,jsx}'],
  },
});
