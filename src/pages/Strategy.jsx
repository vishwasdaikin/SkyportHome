import './PlaybookPage.css'

export default function Strategy() {
  return (
    <article className="playbook-page">
      <header className="page-header">
        <h1>Digital Strategy</h1>
        <p className="lead">
          Vision, pillars, and strategic priorities for our digital transformation.
        </p>
        <p className="deck-ref">
          <a href="/Digital-Strategy-Operating-Playbook.pptx" target="_blank" rel="noopener noreferrer">
            View or download full deck (PowerPoint)
          </a>
        </p>
      </header>

      <section>
        <h2>Vision</h2>
        <p>
          [Replace with your strategy vision from the PowerPoint — e.g. “To be the leading digital-first organization in our space, delivering exceptional value to customers and stakeholders through technology and data.”]
        </p>
      </section>

      <section>
        <h2>Strategic pillars</h2>
        <p>Structure these to match your deck. Example pillars:</p>
        <ul className="pillar-list">
          <li><strong>Customer experience</strong> — Digital-first touchpoints and seamless journeys.</li>
          <li><strong>Data & insights</strong> — Leveraging data for decision-making and personalization.</li>
          <li><strong>Operational excellence</strong> — Automation, efficiency, and scalable processes.</li>
          <li><strong>Innovation & partnership</strong> — New capabilities and ecosystem partnerships.</li>
        </ul>
      </section>

      <section>
        <h2>Priorities this period</h2>
        <p>
          [Add 3–5 top priorities from your playbook. You can replace this block with real content and add more sections (e.g. KPIs, roadmap) as you build out the site.]
        </p>
        <ol>
          <li>Priority one — placeholder</li>
          <li>Priority two — placeholder</li>
          <li>Priority three — placeholder</li>
        </ol>
      </section>
    </article>
  )
}
