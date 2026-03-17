import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'
import AuthProvider from './auth/AuthProvider'
import App from './App'
import './index.css'

let root
try {
  root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  )
} catch (err) {
  document.getElementById('root').innerHTML =
    '<div style="padding:2rem;font-family:system-ui;max-width:40rem">' +
    '<h1>App failed to start</h1><p>Use <strong>npm run dev</strong> in the project folder, then open <strong>http://localhost:5173</strong> in your browser. Do not open index.html directly as a file.</p>' +
    '<pre style="background:#eee;padding:1rem;overflow:auto;font-size:14px">' + (err && err.message ? err.message : String(err)) + '</pre>' +
    '</div>'
}
