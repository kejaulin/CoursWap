import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {DOMAIN:'http://localhost:3000'},
  },
  server: {
    port: 3000,
    proxy: {
      '/app': {
        target: 'http://localhost:4000/courswap',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app/, ''),
      }
    }
  }
});
