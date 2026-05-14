import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path para GitHub Pages: https://unimauro.github.io/unimaurox-peru-finanzas-publicas/
export default defineConfig({
  plugins: [react()],
  base: '/unimaurox-peru-finanzas-publicas/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
