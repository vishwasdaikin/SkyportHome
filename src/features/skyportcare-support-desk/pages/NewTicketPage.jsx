import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTicket } from '../api/supportDeskApi.js'
import { SUPPORT_PRODUCT, SUPPORT_PRODUCT_LABEL, TICKET_SOURCE } from '../model/types.js'

const base = '/internal/support-desk'

export default function NewTicketPage() {
  const navigate = useNavigate()
  const [issueDescription, setIssueDescription] = useState('')
  const [product, setProduct] = useState(SUPPORT_PRODUCT.SKYPORTCARE)
  const [source, setSource] = useState(TICKET_SOURCE.WEB)
  const [owner, setOwner] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    try {
      const t = await createTicket({
        issueDescription,
        product,
        source,
        owner: owner.trim() || null,
      })
      navigate(`${base}/tickets/${encodeURIComponent(t.id)}`, { replace: true })
    } catch (er) {
      setErr(String(er.message || er))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1 className="support-desk__h1">New ticket</h1>
      <p className="support-desk__muted">Submitting runs automatic AI triage and draft generation (demo).</p>

      <form className="support-desk__card" onSubmit={onSubmit}>
        {err ? <p style={{ color: '#b91c1c' }}>{err}</p> : null}
        <div className="support-desk__field">
          <label className="support-desk__label" htmlFor="sd-issue">
            Issue description
          </label>
          <textarea
            id="sd-issue"
            className="support-desk__textarea"
            required
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="What is happening? What did they try? Any error text?"
          />
        </div>
        <div className="support-desk__field">
          <label className="support-desk__label" htmlFor="sd-product">
            Product
          </label>
          <select id="sd-product" className="support-desk__select" value={product} onChange={(e) => setProduct(e.target.value)}>
            {Object.values(SUPPORT_PRODUCT).map((p) => (
              <option key={p} value={p}>
                {SUPPORT_PRODUCT_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <div className="support-desk__field">
          <label className="support-desk__label" htmlFor="sd-source">
            Source
          </label>
          <select id="sd-source" className="support-desk__select" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value={TICKET_SOURCE.WEB}>Web form</option>
            <option value={TICKET_SOURCE.EMAIL}>Email</option>
            <option value={TICKET_SOURCE.INTERNAL}>Internal</option>
          </select>
        </div>
        <div className="support-desk__field">
          <label className="support-desk__label" htmlFor="sd-owner">
            Owner (optional)
          </label>
          <input id="sd-owner" className="support-desk__input" value={owner} onChange={(e) => setOwner(e.target.value)} />
        </div>
        <button type="submit" className="support-desk__btn support-desk__btn--primary" disabled={busy}>
          {busy ? 'Running triage…' : 'Create & triage'}
        </button>
      </form>
    </>
  )
}
