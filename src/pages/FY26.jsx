import { useState } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import './DigitalStrategy.css'
import './FY26.css'

/** FY2025 by month: thermostats sold (from chart); connected = 10% of sold; active licenses = 1% of sold */
const FY25_MONTHLY_CHART_DATA = [
  { month: "Apr'25", sold: 15439, connected: 1544, activeLicenses: 154 },
  { month: "May'25", sold: 18909, connected: 1891, activeLicenses: 189 },
  { month: "Jun'25", sold: 21066, connected: 2107, activeLicenses: 211 },
  { month: "Jul'25", sold: 20739, connected: 2074, activeLicenses: 207 },
  { month: "Aug'25", sold: 15453, connected: 1545, activeLicenses: 155 },
  { month: "Sep'25", sold: 12025, connected: 1203, activeLicenses: 120 },
  { month: "Oct'25", sold: 12748, connected: 1275, activeLicenses: 127 },
  { month: "Nov'25", sold: 9042, connected: 904, activeLicenses: 90 },
  { month: "Dec'25", sold: 13399, connected: 1340, activeLicenses: 134 },
  { month: "Jan'26", sold: 11424, connected: 1142, activeLicenses: 114 },
  { month: "Feb'26", sold: 12064, connected: 1206, activeLicenses: 121 },
  { month: "Mar'26", sold: 12064, connected: 1206, activeLicenses: 121 },
]

const FY26_TOP_NAV_IDS = [
  'res-solutions',
  'digital-platform',
  'digital-tools-services',
  'res-controls-thermostats',
  'vrv-controls-solutions',
  'lc-controls-solutions',
  'iaq-energy',
  'hot-water-solutions',
]

const FY26_TOP_NAV_TITLES = {
  'res-solutions': 'Res Solutions',
  'digital-platform': 'Digital Platform',
  'digital-tools-services': 'Digital Tools & Services',
  'res-controls-thermostats': 'Res Controls & Thermostats',
  'vrv-controls-solutions': 'VRV Controls & Solutions',
  'lc-controls-solutions': 'LC Controls & Solutions',
  'iaq-energy': 'IAQ & Energy',
  'hot-water-solutions': 'Hot Water Solutions',
}

const FY26_BASE = '/strategy/fy26'

const FY26_CARD_SECTIONS = [
  { id: 'fy25-review', title: 'FY25 Review — Execution Reality' },
  { id: 'fy26-plan', title: 'FY26 Plan – Operating Focus' },
  { id: 'fusion30-summary', title: 'Fusion30 Summary - Strategic Horizon' },
]

/** Feature detail template: num, title, description, targetDate, actual (status) */
const FY25_PLANNED_VS_ACTUAL_FEATURES = [
  {
    num: 1,
    title: 'Brand unification (FY24 Carryover)',
    description: 'Move from dedicated dealer and homeowner solutions tied to product brands to a DNA branded solution for dealers and homeowners.',
    targetDate: "June '25",
    actual: "October' 25",
  },
  {
    num: 2,
    title: 'Altherma Product Launch and CS Support',
    description: 'Expand Cloud Services to support Altherma providing tools to improve install, diagnostics and trouble shooting. Enhance the homeowner experience with the installing dealer, and elevate the Daikin experience for the homeowner.',
    targetDate: "September '25",
    actual: 'Not Started',
  },
  {
    num: 3,
    title: 'Private Label support',
    description: 'Support FIT sales goals by providing a path for very large partners (i.e. Johnstone, WATSCO, etc.) to private label FIT & the homeowner app experience to their brand. Aligns goals of large partners with DNA goals and enabling sales recovery.',
    targetDate: "December '25",
    actual: 'Not Started',
  },
  {
    num: 4,
    title: 'Cloud Connected 24V Lead Generation (FY24 Carryover)',
    description: 'Implement cloud-based algorithms to identify replacement ops. Alerts communicated to dealers and homeowners based on inefficient run, and end of life algorithm. Daikin dealers utilize leads to identify FIT replacement sales opportunities.',
    targetDate: "November '26",
    actual: 'Partially completed',
  },
  {
    num: 5,
    title: 'Demand Response Ready',
    description: 'Support pilot program work in the "Smart" (Partial load) demand response space. Showcase superior performance of Daikin Inverter systems to achieve grid shedding while maintaining desired comfort of homeowners participating in pilot programs. Utilize cloud data to inform product teams of system performance during curtailment events.',
    targetDate: "May '25",
    actual: "October' 25",
  },
  {
    num: 6,
    title: 'Enhanced Energy Reports 2.0 (FY Carryover)',
    description: 'Transition our monthly report from email only to the homeowner app. Gamifying engagement to drive consumer understanding of Inverter technology, and spur ongoing engagement with Daikin brand.',
    targetDate: "February '26",
    actual: 'Not Started',
  },
  {
    num: 7,
    title: 'Quality Install Enhancements (FY24 Carryover)',
    description: 'Enhance the Quality Install process based on VOC from internal stakeholders and dealer council. Focus on reducing installation time, aligning with existing dealer processes, and ensuring reporting captures key data requirements for utility and rebate programs.',
    targetDate: "March '26",
    actual: 'Not Started',
  },
  {
    num: 8,
    title: 'Maintenance report',
    description: "Launch report utilizing cloud data to support dealers' routine maintenance visits. Report will enhance existing processes utilizing data available in Daikin Cloud.",
    targetDate: "March '26",
    actual: 'Not Started',
  },
  {
    num: 9,
    title: 'Support for proprietary zoning products',
    description: 'Streamline the installation and configuration of Daikin proprietary zoning solution with set-up support via mobile app. Cloud Services Quality Install will enable dealers to quickly view, set, and test all zone board and dampers within a zoned system, while also validating airflow, charge, and system configuration.',
    targetDate: "December '25",
    actual: 'Partially Completed',
  },
  {
    num: 10,
    title: 'Automatic Warranty Registration for E-Prem products (FY24 Carryover)',
    description: 'Value-add to the Cloud Services offering, by automatically registering E-Premium products warranty when homeowners activate Cloud Services. Increases dealer value by decreasing the manual processes and data entry required, while ensuring homeowners who purchase E-premium products get a high-end experience.',
    targetDate: "March '26",
    actual: 'Not Started',
  },
]

export default function FY26() {
  const { sectionId } = useParams()
  const [showPlannedDetails, setShowPlannedDetails] = useState(false)
  const [outcomeExpanded, setOutcomeExpanded] = useState({
    a: false,
    b: false,
    c: false,
    d: false,
  })
  const outcomesAllExpanded =
    outcomeExpanded.a &&
    outcomeExpanded.b &&
    outcomeExpanded.c &&
    outcomeExpanded.d
  const isValid = FY26_TOP_NAV_IDS.includes(sectionId)
  if (!isValid) return <Navigate to={`${FY26_BASE}/res-solutions`} replace />

  const isDigitalPlatform = sectionId === 'digital-platform'

  return (
    <article className={`fy26-page${isDigitalPlatform ? '' : ' fy26-page--simple'}`}>
      <header className="ds-header fy26-header">
        <div className="fy26-header-title-row">
          <h1>FY26 Playbook</h1>
          <nav className="fy26-inpage-nav" aria-label="Page sections">
            <a href="#fy25-review">FY25 Review</a>
            <a href="#fy26-plan">FY26 Plan</a>
            <a href="#fusion30-summary">Fusion30 Summary</a>
          </nav>
        </div>
        <p className="ds-tagline">{FY26_TOP_NAV_TITLES[sectionId]}</p>
      </header>
      <div className="ds-layout fy26-layout">
        <div className="ds-sections">
          <section id="fy25-review" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">1</span>
              <h2 className="ds-section-title ds-section-title-single">
                {sectionId === 'digital-platform' ? 'FY25 Review — Execution Reality' : 'FY25 Review'}
              </h2>
            </div>
            {sectionId === 'digital-platform' ? (
            <div className="fy25-review-body">
              <div className="fy25-review-intro">
                <p className="fy25-headline">Strong installed base. Low activation. Limited engagement.</p>
                <p className="fy25-subhead">FY25 showed clear demand signals — but software execution did not convert into sustained value.</p>
              </div>
              <div className="fy25-graphs-row fy25-two-col">
                <div className="fy25-graph-left">
                  <div className="fy25-visual fy25-funnel">
                    <h5 className="fy25-visual-title">Installed Base Activation Funnel (All‑Time)</h5>
                    <div className="fy25-funnel-steps">
                      <div className="fy25-funnel-row">
                        <span className="fy25-funnel-label">Thermostats sold (all‑time)</span>
                        <span className="fy25-funnel-value fy25-funnel-abs-only">610,064</span>
                      </div>
                      <div className="fy25-funnel-row">
                        <span className="fy25-funnel-label">Connected to Cloud / App</span>
                        <span className="fy25-funnel-value fy25-funnel-value-pct"><span className="fy25-funnel-pct">56%</span> <span className="fy25-funnel-abs">(~341K)</span></span>
                        <div className="fy25-funnel-bar" style={{ width: '56%' }} />
                      </div>
                      <div className="fy25-funnel-row">
                        <span className="fy25-funnel-label">Active Cloud Services licenses</span>
                        <span className="fy25-funnel-value fy25-funnel-value-pct"><span className="fy25-funnel-pct fy25-funnel-pct-bold">3.5%</span> <span className="fy25-funnel-abs">(~12K)</span></span>
                        <div className="fy25-funnel-bar" style={{ width: '3.5%' }} />
                      </div>
                      <div className="fy25-funnel-row">
                        <span className="fy25-funnel-label">Loyalty dealers with Cloud Services activated</span>
                        <span className="fy25-funnel-value fy25-funnel-value-pct"><span className="fy25-funnel-pct">~11%</span></span>
                        <div className="fy25-funnel-bar" style={{ width: '11%' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="fy25-graph-right">
                  <div className="fy25-visual fy25-bars">
                    <h5 className="fy25-visual-title">Engagement Gap</h5>
                    <div className="fy25-bar-item">
                      <span className="fy25-bar-label">% dealers in loyalty programs</span>
                      <div className="fy25-bar-track"><div className="fy25-bar-fill" style={{ width: '40%' }} /></div>
                    </div>
                    <div className="fy25-bar-item">
                      <span className="fy25-bar-label">% dealers with Cloud Services accounts activated</span>
                      <div className="fy25-bar-track"><div className="fy25-bar-fill fy25-bar-fill-low" style={{ width: '11%' }} /></div>
                      <span className="fy25-bar-value">11%</span>
                    </div>
                    <p className="fy25-caption">“Dealer engagement never reached escape velocity.”</p>
                  </div>
                </div>
              </div>

              <div className="fy25-monthly-chart-wrap">
                <h5 className="fy25-visual-title fy25-chart-title">FY25: Thermostat Sales vs. Digital Adoption Outcomes</h5>
                <p className="fy25-opportunity"><strong>Opportunity:</strong> Closing the activation gap converts existing hardware volume into recurring digital value.</p>
                <ResponsiveContainer width="100%" height={494}>
                  <ComposedChart data={FY25_MONTHLY_CHART_DATA} margin={{ top: 8, right: 140, left: 56, bottom: 36 }} {...{ overflow: 'visible' }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" fill="#fff" />
                    <XAxis dataKey="month" tick={{ fontSize: 14 }} />
                    <YAxis yAxisId="left" orientation="left" width={50} tick={{ fontSize: 14 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} label={{ value: 'Sold (units)', angle: -90, position: 'insideLeft', offset: -20, style: { fontSize: 14 } }} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      width={72}
                      tick={{ fontSize: 14 }}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}
                      label={({ viewBox }) => {
                        if (!viewBox || viewBox.height == null) return null
                        const cx = viewBox.x + viewBox.width - 20
                        const cy = viewBox.y + viewBox.height / 2
                        const lineHeight = 20
                        return (
                          <text transform={`rotate(-90, ${cx}, ${cy})`} x={cx} y={cy} textAnchor="middle" fontSize={14} fill="#6b7280">
                            <tspan x={cx} dy={0}>
                              Connected systems and Active <tspan fontWeight={700}>SkyportCare</tspan>
                            </tspan>
                            <tspan x={cx} dy={lineHeight}>
                              licenses (units)
                            </tspan>
                          </text>
                        )
                      }}
                    />
                    <Tooltip formatter={(v) => v.toLocaleString()} labelFormatter={(l) => l} cursor={{ fill: '#fff' }} />
                    <Bar yAxisId="left" dataKey="sold" name="Thermostats sold" fill="rgba(0, 151, 224, 0.38)" radius={[4, 4, 0, 0]} />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="connected"
                      name="Connected"
                      stroke="#e67e22"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      label={({ index, x, y }) => (index === FY25_MONTHLY_CHART_DATA.length - 1
                        ? <text x={x} y={y - 20} textAnchor="middle" fontSize={12} fill="#e67e22" fontWeight={500}>Connected</text>
                        : null)}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="activeLicenses"
                      name="Active licenses"
                      stroke="#9b59b6"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      label={({ index, x, y }) => (index === FY25_MONTHLY_CHART_DATA.length - 1
                        ? <text x={x} y={y - 14} textAnchor="middle" fontSize={12} fill="#9b59b6" fontWeight={500}>Active licenses</text>
                        : null)}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="fy25-chart-annotation">
                  <p>Active licenses remain a <strong>small</strong> fraction of connected systems.</p>
                  <p>The space between the two lines is the engagement and monetization gap.</p>
                </div>
              </div>

              <div className="fy25-planned-full">
                <div className="fy25-planned-card">
                  <h4 className="fy25-planned-card-title">Planned vs Actual initiatives</h4>
                  {!showPlannedDetails && (() => {
                    const order = [0, 5, 1, 6, 2, 7, 3, 8, 4, 9]
                    let notStarted = 0, partial = 0, completed = 0
                    order.forEach((i) => {
                      const f = FY25_PLANNED_VS_ACTUAL_FEATURES[i]
                      const st = !f.actual || f.actual === '—' ? 'not-started' : /not started/i.test(f.actual) ? 'not-started' : /partially completed/i.test(f.actual) ? 'partial' : 'completed'
                      if (st === 'not-started') notStarted++; else if (st === 'partial') partial++; else completed++
                    })
                    return (
                      <div className="fy25-planned-collapsed">
                        <p className="fy25-planned-context">Most FY25 software initiatives were planned but not operationalized at scale.</p>
                        <p className="fy25-planned-summary">
                          <span className="fy25-summary-dot fy25-summary-not-started" aria-hidden>🔴</span> Not Started ({notStarted})
                          {' '}<span className="fy25-summary-dot fy25-summary-partial" aria-hidden>🟡</span> Partially Completed ({partial})
                          {' '}<span className="fy25-summary-dot fy25-summary-completed" aria-hidden>✅</span> Completed ({completed})
                        </p>
                        <button type="button" className="fy25-planned-toggle" onClick={() => setShowPlannedDetails((v) => !v)} aria-expanded={false}>
                          View initiative details (+)
                        </button>
                      </div>
                    )
                  })()}
                  {showPlannedDetails && (
                  <>
                  <button type="button" className="fy25-planned-toggle" onClick={() => setShowPlannedDetails((v) => !v)} aria-expanded={true}>
                    Hide initiative details (−)
                  </button>
                  <p className="fy25-planned-context">The majority of FY25 software initiatives were planned but not operationalized at scale.</p>
                  <div className="fy25-feature-cols">
                          {[0, 5, 1, 6, 2, 7, 3, 8, 4, 9].map((i) => {
                            const f = FY25_PLANNED_VS_ACTUAL_FEATURES[i]
                            const actualStatus = !f.actual || f.actual === '—' ? 'not-started' : /not started/i.test(f.actual) ? 'not-started' : /partially completed/i.test(f.actual) ? 'partial' : 'completed'
                            const sentences = f.description.split(/(?<!i\.e)(?<!e\.g)(?<!etc)\.\s+/).map((s) => s.trim()).filter(Boolean)
                            const hasBullets = sentences.length > 1
                            return (
                              <div key={f.num} className="fy25-feature-item">
                                <div className="fy25-feature-title-row">
                                  <span className="fy25-feature-badge">{f.num}</span>
                                  <span className="fy25-feature-title">{f.title}</span>
                                </div>
                                {hasBullets ? (
                                  <ul className="fy25-list fy25-feature-desc">
                                    {sentences.map((s, j) => (
                                      <li key={j}>{s}{s.endsWith('.') ? '' : '.'}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="fy25-feature-desc">{f.description}</p>
                                )}
                                <p className="fy25-feature-meta">
                                  <strong>Target Date:</strong> {f.targetDate} · <strong>Actual:</strong>{' '}
                                  <span className={`fy25-actual fy25-actual-${actualStatus}`}>{actualStatus === 'completed' && <span className="fy25-actual-check" aria-hidden>✅ </span>}{f.actual}</span>
                                </p>
                              </div>
                            )
                          })}
                  </div>
                  </>
                  )}
                </div>
              </div>

              <div className="fy25-takeaway">
                <h4 className="fy25-takeaway-title">Takeaway</h4>
                <ul className="fy25-takeaway-list">
                  <li>Hardware demand was strong, but digital activation and engagement did not scale.</li>
                  <li>
                    The activation gap persisted throughout FY25, indicating a systemic execution issue rather
                    than seasonality.
                  </li>
                  <li>
                    Most planned software initiatives did not operationalize at scale, limiting downstream
                    monetization.
                  </li>
                  <li>
                    Closing the activation gap represents the largest near‑term growth opportunity without
                    incremental hardware volume.
                  </li>
                </ul>
                <p className="fy25-takeaway-bottomline">
                  <strong>Bottom-line:</strong> Strategy was not the constraint. Execution ownership,
                  prioritization, and throughput were.
                </p>
              </div>
            </div>
            ) : (
            <div className="ds-content">
              <p className="ds-subheading"><strong>Results vs plan</strong></p>
              <p className="ds-subheading"><strong>Playbook theme execution and impact</strong></p>
              <p className="ds-subheading"><strong>Summary and explanation of gaps, countermeasures moving forward</strong></p>
            </div>
            )}
          </section>
          <section id="fy26-plan" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">2</span>
              <h2 className="ds-section-title ds-section-title-single">FY26 Plan – Operating Focus</h2>
            </div>
            {isDigitalPlatform ? (
              <div className="fy26-plan-cards">
                <>
                  <div className="fy26-mini-card fy26-outcomes-box" id="fy26-outcomes">
                    <div className="fy26-outcomes-header">
                      <h4 className="fy26-mini-card-title fy26-mini-card-title--letter-badge">
                        <a href="#fy26-outcomes" className="fy26-outcomes-heading-anchor">
                          <span className="fy26-plan-letter-badge">A</span>
                          <span>Goals</span>
                        </a>
                      </h4>
                      <div className="fy26-strategic-themes-bulk-actions">
                        <button
                          type="button"
                          className="fy26-strategic-themes-bulk-btn"
                          onClick={() =>
                            outcomesAllExpanded
                              ? setOutcomeExpanded({
                                  a: false,
                                  b: false,
                                  c: false,
                                  d: false,
                                })
                              : setOutcomeExpanded({
                                  a: true,
                                  b: true,
                                  c: true,
                                  d: true,
                                })
                          }
                          aria-expanded={outcomesAllExpanded}
                        >
                          {outcomesAllExpanded ? 'Collapse all' : 'Expand all'}
                        </button>
                      </div>
                    </div>
                    <div className="fy26-outcomes-goals-grid" role="list">
                      <div className="fy26-outcome-row" role="listitem">
                        <button
                          type="button"
                          className="fy26-outcome-collapse-trigger"
                          onClick={() =>
                            setOutcomeExpanded((s) => ({ ...s, b: !s.b }))
                          }
                          aria-expanded={outcomeExpanded.b}
                          id="fy26-outcome-trigger-b"
                          aria-controls="fy26-outcome-panel-b"
                        >
                          <span
                            className={`fy26-outcome-chevron ${outcomeExpanded.b ? 'is-open' : ''}`}
                            aria-hidden
                          >
                            {outcomeExpanded.b ? '▾' : '▸'}
                          </span>
                          <span className="fy26-outcome-collapse-title">
                            Increase Ongoing Homeowner Engagement
                          </span>
                        </button>
                        {outcomeExpanded.b && (
                          <div
                            className="fy26-outcome-expanded"
                            id="fy26-outcome-panel-b"
                            role="region"
                            aria-labelledby="fy26-outcome-trigger-b"
                          >
                            <ul className="fy26-outcome-detail-list">
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Goal: </span>
                                <span className="fy26-goal-colon-value">
                                  Increase repeat, value‑driven homeowner engagement through{' '}
                                  <strong>SkyportHome</strong>.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Target: </span>
                                <span className="fy26-goal-colon-value">
                                  Establish consistent monthly engagement across a meaningful share of connected
                                  homeowners.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Business Impact: </span>
                                <span className="fy26-goal-colon-value">
                                  Engagement is the leading indicator for renewal, upsell, and long-term
                                  retention; without it, digital revenue does not scale.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Primary KPI(s): </span>
                                <span className="fy26-goal-colon-value">
                                  Monthly active users (MAU), % of connected systems with ≥1 meaningful monthly
                                  action, insight / report interaction rate
                                </span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="fy26-outcome-row" role="listitem">
                        <button
                          type="button"
                          className="fy26-outcome-collapse-trigger"
                          onClick={() =>
                            setOutcomeExpanded((s) => ({ ...s, a: !s.a }))
                          }
                          aria-expanded={outcomeExpanded.a}
                          id="fy26-outcome-trigger-a"
                          aria-controls="fy26-outcome-panel-a"
                        >
                          <span
                            className={`fy26-outcome-chevron ${outcomeExpanded.a ? 'is-open' : ''}`}
                            aria-hidden
                          >
                            {outcomeExpanded.a ? '▾' : '▸'}
                          </span>
                          <span className="fy26-outcome-collapse-title">
                            Increase Dealer‑Led Digital Adoption
                          </span>
                        </button>
                        {outcomeExpanded.a && (
                          <div
                            className="fy26-outcome-expanded"
                            id="fy26-outcome-panel-a"
                            role="region"
                            aria-labelledby="fy26-outcome-trigger-a"
                          >
                            <ul className="fy26-outcome-detail-list">
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Goal: </span>
                                <span className="fy26-goal-colon-value">
                                  Increase active <strong>SkyportCare</strong> licenses as a percentage of
                                  connected systems.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Target: </span>
                                <span className="fy26-goal-colon-value">
                                  Increase active license penetration from ~1% today to low double‑digit levels
                                  (~10–12%) across connected systems.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Business Impact: </span>
                                <span className="fy26-goal-colon-value">
                                  Converts existing hardware volume into recurring, high‑margin digital value
                                  without incremental equipment sales.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Primary KPI(s): </span>
                                <span className="fy26-goal-colon-value">
                                  Active license penetration (% of connected systems), Net new active licenses
                                </span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="fy26-outcome-row" role="listitem">
                        <button
                          type="button"
                          className="fy26-outcome-collapse-trigger"
                          onClick={() =>
                            setOutcomeExpanded((s) => ({ ...s, c: !s.c }))
                          }
                          aria-expanded={outcomeExpanded.c}
                          id="fy26-outcome-trigger-c"
                          aria-controls="fy26-outcome-panel-c"
                        >
                          <span
                            className={`fy26-outcome-chevron ${outcomeExpanded.c ? 'is-open' : ''}`}
                            aria-hidden
                          >
                            {outcomeExpanded.c ? '▾' : '▸'}
                          </span>
                          <span className="fy26-outcome-collapse-title">
                            Grow Predictable Recurring Digital Revenue
                          </span>
                        </button>
                        {outcomeExpanded.c && (
                          <div
                            className="fy26-outcome-expanded"
                            id="fy26-outcome-panel-c"
                            role="region"
                            aria-labelledby="fy26-outcome-trigger-c"
                          >
                            <ul className="fy26-outcome-detail-list">
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Goal: </span>
                                <span className="fy26-goal-colon-value">
                                  Grow predictable, recurring digital revenue from <strong>SkyportCare</strong>{' '}
                                  licenses and platform services.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Target: </span>
                                <span className="fy26-goal-colon-value">
                                  Achieve first‑year scale in digital recurring revenue through licensing and
                                  services.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Business Impact: </span>
                                <span className="fy26-goal-colon-value">
                                  Creates a scalable revenue layer that funds digital investment without margin
                                  dilution in the hardware business.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Primary KPI(s): </span>
                                <span className="fy26-goal-colon-value">
                                  Digital ARR, License renewal rate, Revenue per connected system
                                </span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="fy26-outcome-row" role="listitem">
                        <button
                          type="button"
                          className="fy26-outcome-collapse-trigger"
                          onClick={() =>
                            setOutcomeExpanded((s) => ({ ...s, d: !s.d }))
                          }
                          aria-expanded={outcomeExpanded.d}
                          id="fy26-outcome-trigger-d"
                          aria-controls="fy26-outcome-panel-d"
                        >
                          <span
                            className={`fy26-outcome-chevron ${outcomeExpanded.d ? 'is-open' : ''}`}
                            aria-hidden
                          >
                            {outcomeExpanded.d ? '▾' : '▸'}
                          </span>
                          <span className="fy26-outcome-collapse-title">
                            Increase Lifetime Value per Installed System
                          </span>
                        </button>
                        {outcomeExpanded.d && (
                          <div
                            className="fy26-outcome-expanded"
                            id="fy26-outcome-panel-d"
                            role="region"
                            aria-labelledby="fy26-outcome-trigger-d"
                          >
                            <ul className="fy26-outcome-detail-list">
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Goal: </span>
                                <span className="fy26-goal-colon-value">
                                  Increase lifetime value (LTV) per installed system through platform‑led
                                  services.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Target: </span>
                                <span className="fy26-goal-colon-value">
                                  Begin shifting value capture from one‑time install economics toward multi‑year,
                                  per‑home value.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Business Impact: </span>
                                <span className="fy26-goal-colon-value">
                                  Maximizes return on the installed base while strengthening dealer loyalty
                                  through differentiated, data‑backed services.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Primary KPI(s): </span>
                                <span className="fy26-goal-colon-value">
                                  LTV per connected system, Multi‑service attachment rate, Retention / churn rate
                                </span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="fy26-mini-card fy26-strategic-themes-box">
                    <div className="fy26-strategic-themes-header">
                      <h4 className="fy26-mini-card-title fy26-mini-card-title--letter-badge">
                        <span className="fy26-plan-letter-badge">B</span>
                        <span>Strategic Themes</span>
                      </h4>
                    </div>
                    <ul className="fy26-strategic-themes-list">
                      <li>
                        <span className="fy26-strategic-themes-lead">Activation &amp; Onboarding:</span> Moves
                        systems from connected to activated, directly driving active license adoption and recurring
                        digital revenue.
                      </li>
                      <li>
                        <span className="fy26-strategic-themes-lead">Engagement &amp; Action:</span> Sustained
                        homeowner and dealer engagement that enables renewals, upsell, and lifecycle monetization.
                      </li>
                      <li>
                        <span className="fy26-strategic-themes-lead">Monetization &amp; Packaging:</span>{' '}
                        Predictable, scalable digital revenue aligned to FY26 DCBU budget objectives.
                      </li>
                      <li>
                        <span className="fy26-strategic-themes-lead">Platform &amp; Integration:</span> Consistent
                        execution at scale by eliminating fragmented tools and manual workarounds.
                      </li>
                      <li>
                        <span className="fy26-strategic-themes-lead">Operating Cadence &amp; Ownership:</span>{' '}
                        Execution throughput required to meet modeled FY26 growth assumptions.
                      </li>
                    </ul>
                  </div>
                  <div className="fy26-mini-card">
                    <h4 className="fy26-mini-card-title fy26-mini-card-title--letter-badge">
                      <span className="fy26-plan-letter-badge">C</span>
                      <span>Execution Plan</span>
                    </h4>
                    <p className="fy26-execution-plan-principle">
                      <span className="fy26-execution-plan-principle-label">UX Principle:</span> All FY26
                      execution prioritizes simple, consistent, and outcome-driven user experiences across{' '}
                      <strong>SkyportHome</strong> and <strong>SkyportCare</strong>.
                    </p>
                    <p className="fy26-execution-plan-ownership">
                      Execution is led through product‑level ownership, with development capacity augmented
                      through external partners.
                    </p>
                    <div className="fy26-execution-plan-table-wrap">
                      <table className="fy26-execution-plan-table">
                        <thead>
                          <tr>
                            <th scope="col">Strategic Theme</th>
                            <th scope="col">Key Actions</th>
                            <th scope="col" className="fy26-execution-plan-th-pic">
                              PIC
                            </th>
                            <th scope="col">Key Dependencies</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="fy26-execution-plan-theme-name">Activation &amp; Onboarding</td>
                            <td>
                              <ul>
                                <li>Simplify dealer and homeowner activation flows</li>
                                <li>
                                  Standardize activation at install and commissioning (Quality Install as default
                                  path)
                                </li>
                                <li>Reduce friction from install → first value</li>
                              </ul>
                            </td>
                            <td className="fy26-execution-plan-pic">SkyportCare Product Management</td>
                            <td>
                              <ul>
                                <li>Platform services</li>
                                <li>UX design standards</li>
                                <li>Dealer processes</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="fy26-execution-plan-theme-name">Engagement &amp; Action</td>
                            <td>
                              <ul>
                                <li>
                                  Shift from passive monitoring to actionable insights (reports, alerts,
                                  recommended actions)
                                </li>
                                <li>
                                  Establish recurring engagement loops across <strong>SkyportHome</strong> and{' '}
                                  <strong>SkyportCare</strong>
                                </li>
                                <li>
                                  Surface dealer-initiated actions through consistent homeowner experiences
                                </li>
                              </ul>
                            </td>
                            <td className="fy26-execution-plan-pic">SkyportHome Product Management</td>
                            <td>
                              <ul>
                                <li>Data &amp; analytics</li>
                                <li>Notifications</li>
                                <li>UX design standards</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="fy26-execution-plan-theme-name">Monetization &amp; Packaging</td>
                            <td>
                              <ul>
                                <li>Simplify license packaging (bundles, defaults, renewal paths)</li>
                                <li>
                                  Align pricing and packaging to dealer workflows and per-home value models
                                </li>
                                <li>
                                  Reduce cognitive and transactional friction to purchase and renew
                                </li>
                              </ul>
                            </td>
                            <td className="fy26-execution-plan-pic">
                              Platform / Monetization Product Management
                            </td>
                            <td>
                              <ul>
                                <li>Finance &amp; pricing governance</li>
                                <li>Billing systems</li>
                                <li>Legal</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="fy26-execution-plan-theme-name">Platform &amp; Integration</td>
                            <td>
                              <ul>
                                <li>
                                  Establish <strong>SkyportCare</strong> as the primary dealer front door with
                                  backend integrations
                                </li>
                                <li>
                                  Reduce dependency on emails, tribal knowledge, and disconnected tools
                                </li>
                                <li>
                                  Enable feature reuse across <strong>SkyportHome</strong> and{' '}
                                  <strong>SkyportCare</strong> through shared platform services
                                </li>
                              </ul>
                            </td>
                            <td className="fy26-execution-plan-pic">
                              Platform Architecture / Product Management
                            </td>
                            <td>
                              <ul>
                                <li>Digital tool integrations</li>
                                <li>Security</li>
                                <li>Legacy tools</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="fy26-execution-plan-theme-name">Operating Cadence &amp; Ownership</td>
                            <td>
                              <ul>
                                <li>Establish clear end-to-end product ownership per theme</li>
                                <li>
                                  Increase release cadence aligned to engagement and monetization goals
                                </li>
                                <li>Shift from project-based delivery to outcome-based execution</li>
                              </ul>
                            </td>
                            <td className="fy26-execution-plan-pic">Digital Leadership</td>
                            <td>
                              <ul>
                                <li>Org design</li>
                                <li>Funding</li>
                                <li>Partner capacity</li>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="fy26-execution-plan-footnote">
                      Detailed{' '}
                      <Link to="/apps/skyport-home" className="fy26-execution-plan-product-link">
                        <strong>SkyportHome</strong>
                      </Link>{' '}
                      and{' '}
                      <Link to="/apps/skyport-care" className="fy26-execution-plan-product-link">
                        <strong>SkyportCare</strong>
                      </Link>{' '}
                      features and capabilities are documented on the product pages and are not repeated here.
                    </p>
                  </div>
                  <div className="fy26-mini-card">
                    <h4 className="fy26-mini-card-title fy26-mini-card-title--letter-badge">
                      <span className="fy26-plan-letter-badge">D</span>
                      <span>Interaction &amp; Alignment with Other Teams</span>
                    </h4>
                    <ul className="fy26-operating-model-list">
                      <li>
                        Digital Platforms owns end‑to‑end definition, prioritization, and orchestration of digital
                        experiences across <strong>SkyportHome</strong> and <strong>SkyportCare</strong>.
                      </li>
                      <li>
                        Controls Engineering owns hardware behavior, commissioning logic, and system‑level data
                        generation; digital teams consume and operationalize this data.
                      </li>
                      <li>
                        Sales &amp; Dealer Enablement partner on dealer workflows, onboarding, and adoption
                        feedback; digital teams define and scale standardized experiences.
                      </li>
                      <li>
                        IT / Platform Services support shared services (identity, security, infrastructure);
                        digital teams own product logic and user experience.
                      </li>
                      <li>
                        External software partners augment delivery capacity under Digital Platforms direction and
                        roadmap governance.
                      </li>
                    </ul>
                  </div>
                </>
              </div>
            ) : (
              <div className="ds-content fy26-plan-simple-list">
                <p className="ds-subheading">
                  <strong>A.</strong> Goals aligned to FY26 DCBU budget objectives.
                </p>
                <p className="ds-subheading">
                  <strong>B.</strong> Specific Themes to support achieving the DCBU budget objectives.
                </p>
                <p className="ds-subheading">
                  <strong>C.</strong> Clear action items with start/finish dates, PIC and dependencies.
                </p>
                <p className="ds-subheading">
                  <strong>D.</strong> Clarity on interaction and alignment with other stakeholders / teams of your
                  designated themes/initiatives.
                </p>
              </div>
            )}
          </section>
          <section id="fusion30-summary" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">3</span>
              <h2 className="ds-section-title ds-section-title-single">Fusion30 Summary - Strategic Horizon</h2>
            </div>
            {isDigitalPlatform ? (
              <div className="ds-content fy26-fusion30-content">
                <p className="ds-subheading">
                  <strong>What we aim to accomplish</strong>
                </p>
                <p className="fy26-fusion30-aims-intro">
                  By the Fusion30 horizon, digital platforms become a core growth engine that compounds value
                  across Daikin&apos;s installed base.
                </p>
                <ul className="fy26-fusion30-aims-list">
                  <li>
                    Reach 2M+ engaged homeowners across <strong>SkyportHome</strong>
                  </li>
                  <li>Achieve broad, sustained digital service adoption across connected systems</li>
                  <li>Build a meaningful recurring digital revenue stream</li>
                  <li>
                    Shift value capture from one‑time installs to multi‑year, per‑home value
                  </li>
                  <li>
                    Establish a scalable foundation for energy, electrification, and whole‑home services
                  </li>
                </ul>
                <p className="ds-subheading fy26-fusion30-how-heading">
                  <strong>How we will accomplish this</strong>
                </p>
                <ul className="fy26-fusion30-aims-list fy26-fusion30-how-list">
                  <li>
                    Execute across the full lifecycle: install → operate → service → replace
                  </li>
                  <li>
                    Use <strong>SkyportHome</strong> for homeowner engagement and <strong>SkyportCare</strong> for
                    dealer execution
                  </li>
                  <li>
                    Operate with product‑led ownership and outcome‑based prioritization
                  </li>
                  <li>
                    Convert connectivity into activation, engagement, and monetization
                  </li>
                  <li>
                    Reduce fragmentation through shared platform services and UX‑first execution
                  </li>
                </ul>
              </div>
            ) : (
              <div className="ds-content">
                <p className="ds-subheading">
                  <strong>What you want to accomplish with Fusion30 (QAP Quantitative Goals)</strong>
                </p>
                <p className="ds-subheading">
                  <strong>How you will accomplish (Qualitative Actions, 5W/2H)</strong>
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </article>
  )
}
