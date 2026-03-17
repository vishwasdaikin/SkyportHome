import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
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
  const [showExecutionPlan, setShowExecutionPlan] = useState(false)
  const isValid = FY26_TOP_NAV_IDS.includes(sectionId)
  if (!isValid) return <Navigate to={`${FY26_BASE}/res-solutions`} replace />

  return (
    <article className="fy26-page">
      <header className="ds-header">
        <h1>FY26 Playbook</h1>
        <p className="ds-tagline">{FY26_TOP_NAV_TITLES[sectionId]}</p>
      </header>
      <div className="ds-layout">
        <nav className="ds-nav" aria-label="Section navigation">
          <p className="ds-nav-title">SECTIONS</p>
          <ol className="ds-nav-list">
            {FY26_CARD_SECTIONS.map((sec, i) => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className="ds-nav-link"
                >
                  <span className="ds-nav-num">{String(i + 1).padStart(2, '0')}</span>
                  {sec.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
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
                        const lines = ['Connected systems and Active SkyportCare', 'licenses (units)']
                        const lineHeight = 20
                        return (
                          <text transform={`rotate(-90, ${cx}, ${cy})`} x={cx} y={cy} textAnchor="middle" fontSize={14} fill="#6b7280">
                            {lines.map((line, i) => (
                              <tspan key={i} x={cx} dy={i === 0 ? 0 : lineHeight}>{line}</tspan>
                            ))}
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
                  <li>The activation gap persisted throughout FY25, indicating a systemic execution issue rather than seasonality.</li>
                  <li>Most planned software initiatives did not operationalize at scale, limiting downstream monetization.</li>
                  <li>
                  Closing the activation gap represents the largest near‑term growth opportunity without incremental hardware volume.
                  <span className="fy25-takeaway-bottomline"><strong>Bottom-line:</strong> Strategy was not the constraint. Execution ownership, prioritization, and throughput were.</span>
                </li>
                </ul>
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
            <div className="fy26-plan-cards">
              <div className="fy26-mini-card">
                <h4 className="fy26-mini-card-title">[A] FY26 Outcomes (metrics)</h4>
                <p className="fy26-mini-card-text">Goals and metrics aligned to FY26 DCBU budget objectives.</p>
              </div>
              <div className="fy26-mini-card">
                <h4 className="fy26-mini-card-title">[B] Strategic Themes (focus areas)</h4>
                <p className="fy26-mini-card-text">Specific themes to support achieving the DCBU budget objectives.</p>
              </div>
              <div className="fy26-mini-card">
                <h4 className="fy26-mini-card-title">[C] Execution Plan</h4>
                <button type="button" className="fy26-mini-card-toggle" onClick={() => setShowExecutionPlan((v) => !v)} aria-expanded={showExecutionPlan}>
                  {showExecutionPlan ? 'Hide details (−)' : 'View details (+)'}
                </button>
                {showExecutionPlan && (
                  <div className="fy26-mini-card-expanded">
                    <p className="fy26-mini-card-text">Clear action items with start/finish dates, PIC and dependencies. Clarity on interaction and alignment with other stakeholders / teams.</p>
                  </div>
                )}
              </div>
              <div className="fy26-mini-card">
                <h4 className="fy26-mini-card-title">[D] Operating Model Shift</h4>
                <p className="fy26-mini-card-text">How we will operate to deliver on FY26 outcomes and themes.</p>
              </div>
            </div>
            <div className="fy26-bottomline">
              <h4 className="fy26-bottomline-title">FY26 Bottom‑line</h4>
              <p className="fy26-bottomline-text">Placeholder: Add key FY26 plan summary and bottom-line message here.</p>
            </div>
          </section>
          <section id="fusion30-summary" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">3</span>
              <h2 className="ds-section-title ds-section-title-single">Fusion30 Summary - Strategic Horizon</h2>
            </div>
            <div className="ds-content">
              <p className="ds-subheading"><strong>What you want to accomplish with Fusion30 (QAP Quantitative Goals)</strong></p>
              <p className="ds-subheading"><strong>How you will accomplish (Qualitative Actions, 5W/2H)</strong></p>
            </div>
          </section>
        </div>
      </div>
    </article>
  )
}
