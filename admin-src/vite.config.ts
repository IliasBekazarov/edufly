import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  server: {
    port: 5174,
    proxy: {
      '/admin/api': { target: 'http://127.0.0.1:3030', changeOrigin: true },
    },
  },
  build: {
    outDir: '../admin',
    emptyOutDir: false,
  },
})
