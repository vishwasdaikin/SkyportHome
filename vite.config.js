import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const coreApiOrigin =
    env.SKYPORT_CORE_URL || process.env.SKYPORT_CORE_URL || 'http://localhost:3001'

  return {
    plugins: [react()],
    define: {
      'import.meta.env.AUTH_MICROSOFT_ENTRA_ID_ID': JSON.stringify(
        env.AUTH_MICROSOFT_ENTRA_ID_ID ?? process.env.AUTH_MICROSOFT_ENTRA_ID_ID ?? ''
      ),
      'import.meta.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER': JSON.stringify(
        env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ?? process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ?? ''
      ),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        env.VITE_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? ''
      ),
    },
    server: {
      proxy: {
        '/api': {
          target: coreApiOrigin,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '') || '/',
        },
      },
    },
  }
})
