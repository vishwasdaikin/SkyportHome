import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'
import AuthProvider from './auth/AuthProvider'
import App from './App'
import './index.css'

function routerBasename() {
  const b = import.meta.env.BASE_URL
  if (!b || b === '/') return undefined
  return b.replace(/\/$/, '') || undefined
}

let root
try {
  root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter basename={routerBasename()}>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  )
} catch (err) {
  const el = document.getElementById('root')
  if (!el) throw err
  const hintHtml = import.meta.env.DEV
    ? '<p>Use <strong>npm run dev</strong> in the project folder, then open <strong>http://localhost:5173</strong> in your browser.</p>'
    : '<p>Try refreshing the page. If this keeps happening, open the site from your published URL (not a downloaded HTML file).</p>'
  el.innerHTML =
    '<div style="padding:2rem;font-family:system-ui;max-width:40rem">' +
    '<h1>App failed to start</h1>' +
    hintHtml +
    '<pre style="background:#eee;padding:1rem;overflow:auto;font-size:14px">' +
    (err && err.message ? err.message : String(err)) +
    '</pre>' +
    '</div>'
}
