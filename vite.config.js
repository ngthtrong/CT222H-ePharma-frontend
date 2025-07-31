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
        target: 'http://localhost:8081', // Địa chỉ server backend của bạn
        changeOrigin: true,
        secure: false,
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
