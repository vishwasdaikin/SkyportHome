import { Activity, Users } from 'lucide-react'

/**
 * Placeholder evidence section: product-level KPIs + feature-level adoption table.
 * Wire to analytics when data is available.
 *
 * @param {{ productLabel: string, roadmapFeatures?: string[] }} props
 */
export default function ProductBoardUsageSection({ productLabel, roadmapFeatures = [] }) {
  const features = Array.isArray(roadmapFeatures) ? roadmapFeatures : []
  const showFeatureRows = features.length > 0

  return (
    <section className="product-board-usage" aria-labelledby="product-board-usage-heading">
      <div className="product-board-usage__intro">
        <h2 id="product-board-usage-heading" className="product-board-usage__title">
          3. Usage &amp; adoption
        </h2>
        <p className="product-board-usage__tag">Evidence section</p>
        <p className="product-board-usage__lede">
          High-level, visual, simple — connects roadmap to reality for <strong>{productLabel}</strong>.
        </p>
      </div>

      <div className="product-board-usage__columns">
        <div className="product-board-usage__block">
          <h3 className="product-board-usage__block-title">Product-level</h3>
          <div className="product-board-usage__kpi-grid">
            <div className="product-board-usage__kpi">
              <div className="product-board-usage__kpi-icon" aria-hidden>
                <Users size={22} strokeWidth={2} />
              </div>
              <div className="product-board-usage__kpi-body">
                <p className="product-board-usage__kpi-label">Total users</p>
                <p className="product-board-usage__kpi-value">—</p>
              </div>
            </div>
            <div className="product-board-usage__kpi">
              <div className="product-board-usage__kpi-icon" aria-hidden>
                <Activity size={22} strokeWidth={2} />
              </div>
              <div className="product-board-usage__kpi-body">
                <p className="product-board-usage__kpi-label">Active users (MAU)</p>
                <p className="product-board-usage__kpi-value">—</p>
              </div>
            </div>
            <div className="product-board-usage__kpi product-board-usage__kpi--wide">
              <div className="product-board-usage__kpi-body product-board-usage__kpi-body--grow">
                <p className="product-board-usage__kpi-label">Growth trend</p>
                <div className="product-board-usage__spark" role="img" aria-label="Growth trend placeholder">
                  <svg viewBox="0 0 120 36" className="product-board-usage__spark-svg" preserveAspectRatio="none">
                    <path
                      d="M0 28 L24 26 L48 22 L72 24 L96 18 L120 16 L120 36 L0 36 Z"
                      fill="rgba(0, 151, 224, 0.14)"
                    />
                    <path
                      d="M0 28 L24 26 L48 22 L72 24 L96 18 L120 16"
                      fill="none"
                      stroke="var(--daikin-blue, #0097e0)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="product-board-usage__growth-caption">
                    <span className="product-board-usage__trend-symbols" aria-hidden>
                      ↑ ↓ →
                    </span>{' '}
                    <span className="product-board-usage__growth-caption-muted">— connect time series</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="product-board-usage__block">
          <h3 className="product-board-usage__block-title">Feature-level</h3>
          <div className="product-board-usage__table-wrap">
            <table className="product-board-usage__table">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">% of users using feature</th>
                  <th scope="col">Frequency</th>
                  <th scope="col">
                    Trend <span className="product-board-usage__th-hint">(↑ ↓ →)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {showFeatureRows ? (
                  features.map((name) => (
                    <tr key={name}>
                      <td className="product-board-usage__feature-name">{name}</td>
                      <td>—</td>
                      <td>—</td>
                      <td>
                        <span className="product-board-usage__trend-cell" title="Connect usage data">
                          →
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="product-board-usage__table-placeholder">
                      Roadmap features from the table above will list here for adoption metrics. Add usage data to
                      replace placeholders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
