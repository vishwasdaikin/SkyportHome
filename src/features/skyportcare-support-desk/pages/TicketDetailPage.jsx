import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTicket, regenerateDraft, updateTicket } from '../api/supportDeskApi.js'
import { getSupportDeskSession } from '../auth/supportDeskSession.js'
import {
  ISSUE_CATEGORY,
  ISSUE_CATEGORY_LABEL,
  SUPPORT_PRODUCT_LABEL,
  TICKET_SOURCE_LABEL,
  TICKET_STATUS,
} from '../model/types.js'

const base = '/internal/support-desk'

export default function TicketDetailPage() {
  const { ticketId } = useParams()
  const [ticket, setTicket] = useState(null)
  const [docs, setDocs] = useState([])
  const [draftEdit, setDraftEdit] = useState('')
  const [categoryOverride, setCategoryOverride] = useState('')
  const [assigneeDraft, setAssigneeDraft] = useState('')
  const [err, setErr] = useState(null)

  const load = useCallback(async () => {
    if (!ticketId) return
    setErr(null)
    try {
      const { ticket: t, docs: d } = await getTicket(decodeURIComponent(ticketId))
      setTicket(t)
      setDocs(d || [])
      setDraftEdit(t?.draftResponse?.text ?? '')
      setCategoryOverride('')
      setAssigneeDraft(t?.owner ?? '')
    } catch (e) {
      setErr(String(e.message || e))
    }
  }, [ticketId])

  useEffect(() => {
    load()
  }, [load])

  if (!ticket && !err) {
    return <p className="support-desk__muted">Loading…</p>
  }
  if (!ticket) {
    return (
      <div className="support-desk__card">
        <p>{err || 'Ticket not found.'}</p>
        <Link to={`${base}/tickets`}>Back to list</Link>
      </div>
    )
  }

  const ai = ticket.aiAnalysis

  async function setStatus(status) {
    await updateTicket(ticket.id, { status })
    await load()
  }

  async function saveCategory() {
    if (!categoryOverride) return
    await updateTicket(ticket.id, { humanCategoryOverride: categoryOverride })
    await load()
  }

  async function approveDraft() {
    const text = draftEdit.trim()
    if (!text) return
    await updateTicket(ticket.id, {
      status: TICKET_STATUS.RESPONDED,
      finalResponse: {
        text,
        sentAt: new Date().toISOString(),
        editedFromDraft: text !== (ticket.draftResponse?.text ?? ''),
      },
    })
    await load()
  }

  async function closeTicket() {
    await updateTicket(ticket.id, { status: TICKET_STATUS.CLOSED })
    await load()
  }

  async function reopen() {
    await updateTicket(ticket.id, {
      status: TICKET_STATUS.NEW,
      reopenedCount: (ticket.reopenedCount || 0) + 1,
    })
    await load()
  }

  async function onRegenerate() {
    setErr(null)
    try {
      await regenerateDraft(ticket.id)
      await load()
    } catch (e) {
      setErr(String(e.message || e))
    }
  }

  async function saveAssignment() {
    setErr(null)
    try {
      await updateTicket(ticket.id, { owner: assigneeDraft.trim() || null })
      await load()
    } catch (e) {
      setErr(String(e.message || e))
    }
  }

  function assignToMe() {
    const em = getSupportDeskSession()?.email
    if (em) setAssigneeDraft(em)
  }

  return (
    <>
      <p className="support-desk__muted">
        <Link to={`${base}/tickets`}>← Tickets</Link>
      </p>
      <h1 className="support-desk__h1">{ticket.id}</h1>
      <div className="support-desk__toolbar">
        <span className={`support-desk__badge support-desk__badge--${ticket.status}`}>{ticket.status.replace('_', ' ')}</span>
        <button type="button" className="support-desk__btn" onClick={() => setStatus(TICKET_STATUS.IN_REVIEW)}>
          Mark in review
        </button>
        <button type="button" className="support-desk__btn support-desk__btn--primary" onClick={approveDraft}>
          Save response &amp; mark responded
        </button>
        <button type="button" className="support-desk__btn" onClick={closeTicket}>
          Close
        </button>
        {ticket.status === TICKET_STATUS.CLOSED ? (
          <button type="button" className="support-desk__btn support-desk__btn--danger" onClick={reopen}>
            Re-open
          </button>
        ) : null}
      </div>
      {err ? <div className="support-desk__card" style={{ color: '#b91c1c' }}>{err}</div> : null}

      <section className="support-desk__card">
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Assignment</h2>
        <p className="support-desk__muted" style={{ marginTop: 0 }}>
          Saving an assignee triggers an email notification (via webhook when configured). Work still happens in the app.
        </p>
        <div className="support-desk__toolbar">
          <input
            type="email"
            className="support-desk__input"
            style={{ maxWidth: '18rem' }}
            placeholder="owner@company.com"
            value={assigneeDraft}
            onChange={(e) => setAssigneeDraft(e.target.value)}
            aria-label="Assignee email"
          />
          <button type="button" className="support-desk__btn" onClick={assignToMe}>
            Assign to me
          </button>
          <button type="button" className="support-desk__btn support-desk__btn--primary" onClick={saveAssignment}>
            Save assignment
          </button>
        </div>
        {ticket.owner ? (
          <p className="support-desk__muted" style={{ margin: '0.5rem 0 0' }}>
            Current owner: <strong>{ticket.owner}</strong>
            {ticket.assignedAt ? ` · since ${ticket.assignedAt.slice(0, 16).replace('T', ' ')}` : ''}
          </p>
        ) : (
          <p className="support-desk__muted" style={{ margin: '0.5rem 0 0' }}>
            Unassigned — primary owner should still get <strong>new ticket</strong> alerts from the webhook.
          </p>
        )}
      </section>

      <div className="support-desk__grid2">
        <section className="support-desk__card">
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Issue</h2>
          <p style={{ margin: 0 }}>{ticket.issueDescription}</p>
          <p className="support-desk__muted" style={{ marginTop: '0.75rem' }}>
            Product: {SUPPORT_PRODUCT_LABEL[ticket.product]} · Created {ticket.createdAt.replace('T', ' ').slice(0, 16)}
          </p>
          {ticket.firstResponseAt ? (
            <p className="support-desk__muted">First response: {ticket.firstResponseAt.slice(0, 16)}</p>
          ) : null}
          {ticket.closedAt ? <p className="support-desk__muted">Closed: {ticket.closedAt.slice(0, 16)}</p> : null}
          {ticket.reopenedCount ? <p className="support-desk__muted">Re-opened: {ticket.reopenedCount}×</p> : null}
          {ticket.source ? (
            <p className="support-desk__muted">Source: {TICKET_SOURCE_LABEL[ticket.source] || ticket.source}</p>
          ) : null}
        </section>

        <section className="support-desk__card">
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Human override · category</h2>
          <div className="support-desk__toolbar">
            <select
              className="support-desk__select"
              value={categoryOverride}
              onChange={(e) => setCategoryOverride(e.target.value)}
              aria-label="Override AI category"
            >
              <option value="">— keep AI —</option>
              {Object.values(ISSUE_CATEGORY).map((c) => (
                <option key={c} value={c}>
                  {ISSUE_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
            <button type="button" className="support-desk__btn" onClick={saveCategory} disabled={!categoryOverride}>
              Apply
            </button>
          </div>
          <p className="support-desk__muted" style={{ margin: 0 }}>
            Current: {ISSUE_CATEGORY_LABEL[ticket.issueCategory]} (confidence {(ticket.issueCategoryConfidence * 100).toFixed(0)}%)
          </p>
        </section>
      </div>

      {ticket.customerEmail || (ticket.customerAttachments && ticket.customerAttachments.length > 0) ? (
        <section className="support-desk__card">
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Customer (public intake)</h2>
          {ticket.customerEmail ? (
            <p style={{ margin: 0 }}>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${encodeURIComponent(ticket.customerEmail)}`}>{ticket.customerEmail}</a>
            </p>
          ) : null}
          {ticket.customerAttachments?.length ? (
            <div style={{ marginTop: '0.75rem' }}>
              <p className="support-desk__muted" style={{ margin: '0 0 0.5rem' }}>
                Attachments from form (data URLs; size limits apply — handle in production server-side).
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                {ticket.customerAttachments.map((a, idx) => (
                  <li key={`${a.filename}-${idx}`}>
                    <a href={a.dataUrl} download={a.filename}>
                      {a.filename}
                    </a>{' '}
                    <span className="support-desk__muted">
                      ({a.mimeType || 'file'}, {(a.sizeBytes / 1024).toFixed(1)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {ai ? (
        <section className="support-desk__card">
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>AI triage (suggestion)</h2>
          <ul className="support-desk__muted" style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li>Type: {ISSUE_CATEGORY_LABEL[ai.issueType]}</li>
            <li>Product signal: {SUPPORT_PRODUCT_LABEL[ai.affectedProduct]}</li>
            <li>Confidence: {(ai.confidence * 100).toFixed(0)}%</li>
            <li>Knowledge gap flag: {ai.possibleKnowledgeGap ? 'yes' : 'no'}</li>
            <li>Keywords: {ai.keywords?.join(', ') || '—'}</li>
          </ul>
        </section>
      ) : null}

      <section className="support-desk__card">
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Grounding · similar tickets</h2>
        {ai?.similarTicketIds?.length ? (
          <ul className="support-desk__mono" style={{ margin: 0 }}>
            {ai.similarTicketIds.map((id) => (
              <li key={id}>
                <Link to={`${base}/tickets/${encodeURIComponent(id)}`}>{id}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="support-desk__muted">None ranked above threshold.</p>
        )}
      </section>

      <section className="support-desk__card">
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Linked docs (semantic v1 = keyword overlap)</h2>
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {(ai?.linkedDocIds || []).map((id) => {
            const d = docs.find((x) => x.id === id)
            return (
              <li key={id}>
                <span className="support-desk__mono">{id}</span>
                {d ? ` — ${d.title}` : ''}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="support-desk__card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem' }}>Draft response (AI → human)</h2>
          <button type="button" className="support-desk__btn" onClick={onRegenerate}>
            Regenerate draft
          </button>
        </div>
        <p className="support-desk__muted">
          Approve stores <strong>finalResponse</strong> and moves lifecycle to <strong>responded</strong>. Edit freely before
          approving — that is the human decision boundary.
        </p>
        <textarea className="support-desk__textarea" value={draftEdit} onChange={(e) => setDraftEdit(e.target.value)} />
        {ticket.finalResponse ? (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.35rem' }}>Final response (committed)</h3>
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                background: '#f8fafc',
                padding: '0.75rem',
                borderRadius: 6,
                border: '1px solid var(--sd-border, #e2e6ea)',
              }}
            >
              {ticket.finalResponse.text}
            </pre>
          </div>
        ) : null}
      </section>
    </>
  )
}
