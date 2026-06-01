import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['sockjs-client', '@stomp/stompjs'],
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: 'http://localhost:8080', changeOrigin: true },
      '/users': { target: 'http://localhost:8080', changeOrigin: true },
      '/projects': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return '/index.html'
        },
      },
      '/proposals': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return '/index.html'
        },
      },
      '/contracts': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return '/index.html'
        },
      },
      '/reviews': { target: 'http://localhost:8080', changeOrigin: true },
      '/messages': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return '/index.html'
        },
      },
      '/notifications': { target: 'http://localhost:8080', changeOrigin: true },
      '/categories': { target: 'http://localhost:8080', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8080', changeOrigin: true },
      '/profile': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return '/index.html'
        },
      },
      '/ws': { target: 'http://localhost:8080', ws: true, changeOrigin: true },
    },
  },
})
