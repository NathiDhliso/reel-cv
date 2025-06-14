import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Keep the port you configured previously
    port: 5173,

    // This is important for single-page applications
    historyApiFallback: true,

    // This proxy is CRITICAL for your API calls to work in development
    proxy: {
      '/api': {
        target: 'http://localhost:8888', // Or whatever port Netlify says it's running on
        changeOrigin: true,
      },
    },
  },
  base: '/',
});