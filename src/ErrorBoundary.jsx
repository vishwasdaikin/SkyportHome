import React from 'react'

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          background: '#f8f7f4',
          color: '#1a1d21',
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#5c6168', marginBottom: '1rem' }}>
            The app hit an error. This usually fixes it:
          </p>
          <ol style={{ marginBottom: '1rem', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
            <li>Use <strong>npm run dev</strong> in the project folder, then open <strong>http://localhost:5173</strong> in the browser (do not open index.html as a file).</li>
            <li>If you already do that, check the error below and fix the cause.</li>
          </ol>
          <pre style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '1rem',
            overflow: 'auto',
            fontSize: '0.875rem',
          }}>
            {this.state.error.toString()}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
