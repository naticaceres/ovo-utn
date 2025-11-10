import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  server: {
    allowedHosts: [
      'ovotest.mooo.com',
      'ovofront.mooo.com',
      'wid84vod2j.execute-api.us-east-2.amazonaws.com',
    ],
    proxy: {
      '/api/chat': {
        target: 'https://wid84vod2j.execute-api.us-east-2.amazonaws.com/prod',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/chat/, '/chat'),
        configure: proxy => {
          proxy.on('error', err => {
            console.log('Proxy error:', err);
          });
        },
      },
    },
  },
});
