import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const allowPreviewHosts = process.env.VITE_ALLOWED_HOSTS === '1'
  return {
    plugins: [react()],
    server: allowPreviewHosts ? { allowedHosts: ['.monkeycode-ai.live'] } : {},
  }
})
