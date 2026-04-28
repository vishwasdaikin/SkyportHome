import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listTickets } from '../api/supportDeskApi.js'
import {
  ISSUE_CATEGORY_LABEL,
  SUPPORT_PRODUCT_LABEL,
  TICKET_STATUS,
} from '../model/types.js'

const base = '/internal/support-desk'

export default function TicketListPage() {
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [tickets, setTickets] = useState([])
  const [err, setErr] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { tickets: rows } = await listTickets({
          status: status || undefined,
          q: q || undefined,
        })
        if (!cancelled) setTickets(rows)
      } catch (e) {
        if (!cancelled) setErr(String(e.message || e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [status, q])

  return (
    <>
      <h1 className="support-desk__h1">Tickets</h1>
      <p className="support-desk__muted">Scan and open items — triage runs automatically on create.</p>

      <div className="support-desk__toolbar">
        <Link to={`${base}/tickets/new`} className="support-desk__btn support-desk__btn--primary">
          New ticket
        </Link>
        <select
          className="support-desk__select"
          style={{ maxWidth: '12rem' }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value={TICKET_STATUS.NEW}>New</option>
          <option value={TICKET_STATUS.IN_REVIEW}>In review</option>
          <option value={TICKET_STATUS.RESPONDED}>Responded</option>
          <option value={TICKET_STATUS.CLOSED}>Closed</option>
        </select>
        <input
          className="support-desk__input"
          style={{ maxWidth: '16rem' }}
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search tickets"
        />
      </div>

      {err ? <div className="support-desk__card">{err}</div> : null}

      <div className="support-desk__table-wrap">
        <table className="support-desk__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Created</th>
              <th>Product</th>
              <th>Category</th>
              <th>Status</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`${base}/tickets/${encodeURIComponent(t.id)}`}>{t.id}</Link>
                </td>
                <td className="support-desk__mono">{t.createdAt.slice(0, 16).replace('T', ' ')}</td>
                <td>{SUPPORT_PRODUCT_LABEL[t.product] ?? t.product}</td>
                <td>{ISSUE_CATEGORY_LABEL[t.issueCategory] ?? t.issueCategory}</td>
                <td>
                  <span className={`support-desk__badge support-desk__badge--${t.status}`}>{t.status.replace('_', ' ')}</span>
                </td>
                <td className="support-desk__muted">{t.issueDescription.slice(0, 72)}{t.issueDescription.length > 72 ? '…' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 ? <p className="support-desk__muted" style={{ padding: '1rem' }}>No tickets yet.</p> : null}
      </div>
    </>
  )
}
