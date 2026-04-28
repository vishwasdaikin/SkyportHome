import { useState } from 'react'
import { createTicket } from '../api/supportDeskApi.js'
import { SUPPORT_PRODUCT, SUPPORT_PRODUCT_LABEL, TICKET_SOURCE } from '../model/types.js'
import './CustomerSupportRequest.css'

const MAX_BYTES = 400_000

function readFileAsAttachment(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_BYTES) {
      reject(new Error(`File is too large (max ${Math.round(MAX_BYTES / 1024)} KB). Try a smaller screenshot or paste text into the description.`))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        dataUrl: String(reader.result),
      })
    }
    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.readAsDataURL(file)
  })
}

/**
 * Public customer intake — no login, no access to the internal desk.
 * Responses are by email only (webhook sends confirmation + future replies).
 */
export default function CustomerSupportRequestPage() {
  const [email, setEmail] = useState('')
  const [product, setProduct] = useState(SUPPORT_PRODUCT.SKYPORTCARE)
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [doneId, setDoneId] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    setDoneId(null)
    try {
      let customerAttachments = null
      if (file) {
        customerAttachments = [await readFileAsAttachment(file)]
      }
      const ticket = await createTicket({
        issueDescription: description.trim(),
        product,
        source: TICKET_SOURCE.CUSTOMER_WEB,
        owner: null,
        customerEmail: email.trim().toLowerCase(),
        customerAttachments,
      })
      setDoneId(ticket.id)
      setDescription('')
      setFile(null)
    } catch (er) {
      setErr(String(er.message || er))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="csr">
      <header className="csr__header">
        <h1 className="csr__title">SkyportCare · Contact support</h1>
        <p className="csr__lede">
          Submit a question or issue. You do <strong>not</strong> need an account. We will email you at the address
          below — please check your inbox (and spam) for your ticket number and confirmation.
        </p>
      </header>

      <main className="csr__main">
        {doneId ? (
          <section className="csr__card csr__card--success" aria-live="polite">
            <h2 className="csr__h2">Request received</h2>
            <p className="csr__p">
              Your ticket ID is <strong className="csr__ticket-id">{doneId}</strong>. A confirmation message should
              arrive at <strong>{email}</strong> shortly. Our team is reviewing your issue; you will hear from us by{' '}
              <strong>email</strong> — there is no customer portal for this channel.
            </p>
            <p className="csr__muted">If you need to add more detail, reply from the same email thread once you receive our message.</p>
          </section>
        ) : null}

        <form className="csr__card" onSubmit={onSubmit}>
          <h2 className="csr__h2">Submit a ticket</h2>
          {err ? <p className="csr__err">{err}</p> : null}

          <div className="csr__field">
            <label className="csr__label" htmlFor="csr-email">
              Your email <span className="csr__req">*</span>
            </label>
            <input
              id="csr-email"
              type="email"
              autoComplete="email"
              required
              className="csr__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="csr__field">
            <label className="csr__label" htmlFor="csr-product">
              Product <span className="csr__req">*</span>
            </label>
            <select id="csr-product" className="csr__input" value={product} onChange={(e) => setProduct(e.target.value)}>
              {Object.values(SUPPORT_PRODUCT).map((p) => (
                <option key={p} value={p}>
                  {SUPPORT_PRODUCT_LABEL[p]}
                </option>
              ))}
            </select>
          </div>

          <div className="csr__field">
            <label className="csr__label" htmlFor="csr-desc">
              Describe the issue <span className="csr__req">*</span>
            </label>
            <textarea
              id="csr-desc"
              required
              className="csr__textarea"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened? When did it start? Any error messages or steps to reproduce?"
            />
          </div>

          <div className="csr__field">
            <label className="csr__label" htmlFor="csr-file">
              Attachment (optional)
            </label>
            <input
              id="csr-file"
              type="file"
              className="csr__file"
              accept="image/*,.txt,.log,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="csr__hint">Screenshot, log, or PDF — max {Math.round(MAX_BYTES / 1024)} KB for this form.</p>
          </div>

          <button type="submit" className="csr__submit" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit request'}
          </button>
        </form>

        <p className="csr__footer-note">
          This page is the only customer-facing step. For dealer documentation, visit your usual SkyportCare resources
          from your installer — not this form.
        </p>
      </main>
    </div>
  )
}
