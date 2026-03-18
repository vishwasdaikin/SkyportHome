import './PlaybookPage.css'

export default function Overview() {
  return (
    <article className="playbook-page">
      <header className="page-header">
        <h1>Digital Strategy Playbook</h1>
        <p className="lead">
          A single source of truth for leadership on our digital strategy, priorities, and key updates.
        </p>
      </header>

      <section>
        <h2>Purpose</h2>
        <p>
          This playbook replaces static slide decks with a living view of our strategy. Use it to stay aligned on goals, track progress, and review the latest updates without digging through decks or email.
        </p>
      </section>

      <section>
        <h2>How to use</h2>
        <ul>
          <li><strong>Overview</strong> — You’re here. High-level context and how to use the playbook.</li>
          <li><strong>Digital Strategy</strong> — Vision, pillars, and strategic priorities.</li>
          <li><strong>Key Updates</strong> — Recent changes, wins, and decisions. Updated as we go.</li>
        </ul>
      </section>

      <section className="card-block">
        <div className="info-card deck-card">
          <h3>Full playbook deck</h3>
          <p>
            The complete <strong>Digital Strategy &amp; Digital Operating Playbook</strong> is available as a PowerPoint deck for offline use or presentation.
          </p>
          <a
            href="/Digital-Strategy-Operating-Playbook.pptx"
            className="deck-download"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download PowerPoint
          </a>
        </div>
        <div className="info-card">
          <h3>Quick links</h3>
          <p>
            Bookmark this site for easy access. New sections and updates will be added here as the strategy evolves.
          </p>
        </div>
      </section>
    </article>
  )
}
