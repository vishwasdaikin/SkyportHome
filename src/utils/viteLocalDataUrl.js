/** Build URL for static assets or Vite dev `/local-data/*` routes under `import.meta.env.BASE_URL`. */
export function viteLocalDataUrl(relativePath) {
  const base = import.meta.env.BASE_URL || '/'
  const r = String(relativePath || '').replace(/^\//, '')
  return `${base.replace(/\/?$/, '/')}${r}`
}
