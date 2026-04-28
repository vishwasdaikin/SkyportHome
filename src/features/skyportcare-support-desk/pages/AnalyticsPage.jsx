import { useEffect, useState } from 'react'
import { analyticsSnapshot } from '../api/supportDeskApi.js'
import { ISSUE_CATEGORY_LABEL, SUPPORT_PRODUCT_LABEL } from '../model/types.js'

function BarRow({ label, value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
        <span>{label}</span>
        <span className="support-desk__muted">{value}</span>
      </div>
      <div className="support-desk__bar-stack">
        <div className="support-desk__bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [snap, setSnap] = useState(null)

  useEffect(() => {
    analyticsSnapshot().then(setSnap)
  }, [])

  if (!snap) return <p className="support-desk__muted">Loading…</p>

  const typeEntries = Object.entries(snap.byType || {})
  const productEntries = Object.entries(snap.byProduct || {})
  const maxType = Math.max(1, ...typeEntries.map(([, v]) => v))
  const maxProd = Math.max(1, ...productEntries.map(([, v]) => v))

  return (
    <>
      <h1 className="support-desk__h1">Analytics (light)</h1>
      <p className="support-desk__muted">Insight-only — not operational SLAs.</p>

      <div className="support-desk__grid2">
        <section className="support-desk__card">
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Volume</h2>
          <p style={{ margin: '0.25rem 0' }}>Total tickets: {snap.total}</p>
          <p style={{ margin: '0.25rem 0' }}>Open: {snap.open}</p>
          <p style={{ margin: '0.25rem 0' }}>Closed: {snap.closed}</p>
          <p style={{ margin: '0.25rem 0' }}>Re-open events: {snap.reopened}</p>
          <p style={{ margin: '0.25rem 0' }}>
            Avg first response:{' '}
            {snap.avgFirstResponseMin != null ? `${snap.avgFirstResponseMin} min (demo)` : '—'}
          </p>
        </section>
        <section className="support-desk__card">
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Knowledge gaps</h2>
          <p style={{ margin: 0 }}>
            Tickets where AI flagged low confidence / unknown: <strong>{snap.knowledgeGapTickets}</strong>
          </p>
          <p className="support-desk__muted" style={{ marginTop: '0.5rem' }}>
            Use this to prioritize new internal articles.
          </p>
        </section>
      </div>

      <section className="support-desk__card" style={{ marginTop: '1rem' }}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>By issue type</h2>
        {typeEntries.map(([k, v]) => (
          <BarRow key={k} label={ISSUE_CATEGORY_LABEL[k] ?? k} value={v} max={maxType} />
        ))}
      </section>

      <section className="support-desk__card" style={{ marginTop: '1rem' }}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>By product</h2>
        {productEntries.map(([k, v]) => (
          <BarRow key={k} label={SUPPORT_PRODUCT_LABEL[k] ?? k} value={v} max={maxProd} />
        ))}
      </section>
    </>
  )
}
