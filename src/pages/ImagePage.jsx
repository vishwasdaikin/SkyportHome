import './ImagePage.css'

const AI_LEARNING_ITEMS = [
  'Maximum comfort',
  'Time-of-Use pricing',
  'Humidification',
  'Predictive pre-conditioning',
  'Smart routines',
  'Demand Response',
]

export default function ImagePage() {
  return (
    <article className="image-page">
      <header className="image-page-header">
        <h1>Image</h1>
        <p className="image-page-desc">DaikinComfort Smart Climate Control</p>
      </header>
      <div className="image-page-figure">
        <div className="image-page-section">
          <img
            src="/images/demos/skyport-home-annotated.png"
            alt="DaikinComfort Smart Climate Control — Living Room, temperature dial, Quick Access, AI Mode and Save More"
            className="image-page-img"
          />
        </div>
        <svg className="image-page-figure-arrow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <marker id="image-page-arrowhead" markerWidth="10" markerHeight="8" refX="5" refY="4" orient="auto">
              <polygon points="0 0, 10 4, 0 8" fill="var(--daikin-blue)" />
            </marker>
          </defs>
          <path d="M 18 51 L 18 72" fill="none" stroke="var(--daikin-blue)" strokeWidth="1.5" markerEnd="url(#image-page-arrowhead)" />
        </svg>
        <div className="image-page-callout">
          <h3 className="image-page-callout-title">AI Learning: Habits, preferences, seasonal patterns</h3>
          <ul className="image-page-callout-list">
            {AI_LEARNING_ITEMS.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}
