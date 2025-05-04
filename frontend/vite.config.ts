import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.ts', '.json', '.jsx', '.tsx', '.vue']
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://47.97.217.4:8081',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
