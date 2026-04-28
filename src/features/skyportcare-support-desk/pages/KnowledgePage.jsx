import { useEffect, useState } from 'react'
import { addKnowledgeDoc, listKnowledgeDocs } from '../api/supportDeskApi.js'
import { SUPPORT_PRODUCT, SUPPORT_PRODUCT_LABEL } from '../model/types.js'

export default function KnowledgePage() {
  const [docs, setDocs] = useState([])
  const [title, setTitle] = useState('')
  const [product, setProduct] = useState(SUPPORT_PRODUCT.SKYPORTCARE)
  const [body, setBody] = useState('')
  const [msg, setMsg] = useState(null)

  async function refresh() {
    setDocs(await listKnowledgeDocs())
  }

  useEffect(() => {
    refresh()
  }, [])

  async function onAdd(e) {
    e.preventDefault()
    setMsg(null)
    await addKnowledgeDoc({ title, product, bodyMarkdown: body })
    setTitle('')
    setBody('')
    setMsg('Document added to local store.')
    await refresh()
  }

  return (
    <>
      <h1 className="support-desk__h1">Knowledge base</h1>
      <p className="support-desk__muted">
        v1: markdown-style chunks in browser storage. Replace with uploaded PDFs/text and embedding index on the server.
      </p>

      <section className="support-desk__card">
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Add document</h2>
        {msg ? <p className="support-desk__muted">{msg}</p> : null}
        <form onSubmit={onAdd}>
          <div className="support-desk__field">
            <label className="support-desk__label" htmlFor="kd-title">
              Title
            </label>
            <input id="kd-title" className="support-desk__input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="support-desk__field">
            <label className="support-desk__label" htmlFor="kd-product">
              Product tag
            </label>
            <select id="kd-product" className="support-desk__select" value={product} onChange={(e) => setProduct(e.target.value)}>
              {Object.values(SUPPORT_PRODUCT).map((p) => (
                <option key={p} value={p}>
                  {SUPPORT_PRODUCT_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
          <div className="support-desk__field">
            <label className="support-desk__label" htmlFor="kd-body">
              Body (markdown or plain text)
            </label>
            <textarea id="kd-body" className="support-desk__textarea" value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          <button type="submit" className="support-desk__btn support-desk__btn--primary">
            Save locally
          </button>
        </form>
      </section>

      <h2 style={{ fontSize: '1rem', margin: '1.25rem 0 0.5rem' }}>Library</h2>
      {docs.map((d) => (
        <article key={d.id} className="support-desk__card">
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem' }}>{d.title}</h3>
          <p className="support-desk__mono support-desk__muted" style={{ margin: '0 0 0.5rem' }}>
            {d.id} · {SUPPORT_PRODUCT_LABEL[d.product] ?? d.product}
          </p>
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '0.8125rem',
              color: '#334155',
            }}
          >
            {d.bodyMarkdown}
          </pre>
        </article>
      ))}
    </>
  )
}
