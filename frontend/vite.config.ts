import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_DEV_SERVER_PROXY ?? 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    envPrefix: ['VITE_'],
  }
})
