import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({}) => {
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: process.env.API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})