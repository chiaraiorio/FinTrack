
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Rimuoviamo base: './' perché Vercel gestisce meglio i path assoluti di default
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  define: {
    // Questo permette all'app di accedere a process.env.API_KEY come richiesto dalle linee guida
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
