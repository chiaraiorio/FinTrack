
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
  },
  define: {
    // Inietta la variabile d'ambiente process.env.API_KEY per il client
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  server: {
    historyApiFallback: true,
  }
});
