import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api/v1': {
        target: 'https://project-back-end-1-iv0w.onrender.com', // Địa chỉ server backend của bạn
        changeOrigin: true,
        secure: true,
        // Đảm bảo forward headers đúng cách
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
            if (req.headers['x-cart-session-id']) {
              proxyReq.setHeader('X-Cart-Session-ID', req.headers['x-cart-session-id']);
            }
          });
        },
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
})
