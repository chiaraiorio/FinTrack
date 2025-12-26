
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Assicura che i file vengano trovati anche in sottocartelle di GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
