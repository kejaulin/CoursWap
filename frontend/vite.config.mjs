import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';


export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': {DOMAIN:'http://localhost:3000'},
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/app': {
        target: 'http://localhost:4000/courswap',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app/, ''),
      },
      '/quizzes': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }, 
  }
});
