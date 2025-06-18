import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {  const env = loadEnv(mode, process.cwd());

  const SERVER_URL = env.SERVER_URL || 'http://localhost:4000';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: SERVER_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/app': {
          target: `${SERVER_URL}/courswap`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app/, ''),
        }
      }
    }
  };
});
