import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // This MUST match targetPort in netlify.toml
    port: 5173, 
    
    historyApiFallback: true,
    
    // This proxy target MUST match port in netlify.toml
    proxy: {
      '/api': {
        target: 'http://localhost:8888', 
        changeOrigin: true,
      },
    },
  },
  base: '/',
});