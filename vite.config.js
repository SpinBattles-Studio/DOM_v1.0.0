import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'es'
      }
    },
    // Remove crossorigin for Electron compatibility
    modulePreload: false
  },
  server: {
    port: 5173,
    host: '127.0.0.1'
  },
  publicDir: 'public'
});
