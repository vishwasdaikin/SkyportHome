import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import localTestXlsx from './vite-plugin-local-test-xlsx.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const coreApiOrigin =
    env.SKYPORT_CORE_URL || process.env.SKYPORT_CORE_URL || 'http://localhost:3001'

  /** GitHub Pages project URLs are /repo-name/ — without this, /assets/* 404s and the app never loads. */
  const basePathRaw = env.VITE_BASE_PATH ?? process.env.VITE_BASE_PATH
  let base = '/'
  if (basePathRaw != null && String(basePathRaw).trim() !== '') {
    const p = String(basePathRaw).trim()
    base = p.endsWith('/') ? p : `${p}/`
  } else if (mode === 'production') {
    base = '/SkyportHome/'
  }

  return {
    base,
    plugins: [react(), localTestXlsx()],
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
      'import.meta.env.VITE_USE_BACKEND_AUTH': JSON.stringify(
        env.VITE_USE_BACKEND_AUTH ?? process.env.VITE_USE_BACKEND_AUTH ?? ''
      ),
      'import.meta.env.VITE_SKIP_AUTH': JSON.stringify(
        env.VITE_SKIP_AUTH ?? process.env.VITE_SKIP_AUTH ?? ''
      ),
      'import.meta.env.VITE_SITE_PASSWORD': JSON.stringify(
        env.VITE_SITE_PASSWORD ?? process.env.VITE_SITE_PASSWORD ?? ''
      ),
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
      include: ['src/**/*.{test,spec}.{js,jsx}'],
    },
    server: {
      strictPort: true,
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
