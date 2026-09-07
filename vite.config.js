import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const allowPreviewHosts = process.env.VITE_ALLOWED_HOSTS === '1'
  const visitorTarget = process.env.VITE_VISITOR_API || 'http://127.0.0.1:8787'
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: visitorTarget,
          changeOrigin: true,
        },
      },
      ...(allowPreviewHosts ? { allowedHosts: ['.monkeycode-ai.live'] } : {}),
    },
  }
})
