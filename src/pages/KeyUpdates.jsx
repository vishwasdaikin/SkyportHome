import './PlaybookPage.css'

const keyUpdates = [
  {
    id: 1,
    date: '2025-03-13',
    title: 'Playbook site launched',
    summary: 'Digital strategy playbook is now live for leadership. Use this site as the single place for strategy and key updates.',
    category: 'Governance',
  },
  {
    id: 2,
    date: '2025-03-01',
    title: 'Strategy refresh approved',
    summary: 'Updated digital strategy pillars and priorities approved by leadership. Focus on customer experience and data-led decisions.',
    category: 'Strategy',
  },
  // Add more updates below — newest first
]

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function KeyUpdatesPage() {
  return (
    <article className="playbook-page">
      <header className="page-header">
        <h1>Key Updates</h1>
        <p className="lead">
          Recent changes, wins, and decisions. Updated regularly so leadership stays in the loop.
        </p>
      </header>

      <section className="updates-list">
        {keyUpdates.map((update) => (
          <article key={update.id} className="update-card">
            <div className="update-meta">
              <time dateTime={update.date}>{formatDate(update.date)}</time>
              <span className="update-category">{update.category}</span>
            </div>
            <h3 className="update-title">{update.title}</h3>
            <p className="update-summary">{update.summary}</p>
          </article>
        ))}
      </section>

      <section className="card-block">
        <div className="info-card muted">
          <p>
            <strong>Adding updates:</strong> Edit the <code>keyUpdates</code> array in <code>src/pages/KeyUpdates.jsx</code> to add new entries. Keep newest at the top. You can later move this to a CMS or API.
          </p>
        </div>
      </section>
    </article>
  )
}
