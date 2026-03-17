import { Link } from 'react-router-dom'
import { useRef, useState, useLayoutEffect } from 'react'
import './DemosAnnotated.css'

// Targets: arrow ends at image edge (x=0.02) for "User Experience" so it doesn't go inside image.
const LEFT_CALLOUTS = [
  {
    title: 'User Experience',
    target: [0.02, 0.18],
    items: [
      'In-app guidance',
      'Iconography',
      'Easy navigation',
      'AI chat: FAQ, feature requests',
      'Simple error code explanation',
      'Hide unavailable features',
    ],
  },
  { title: 'Header & account', target: [0.88, 0.07], items: ['App branding', 'Account & preferences', 'Status indicators'] },
  { title: 'Temperature target', target: [0.5, 0.36], items: ['72° current & target', '− / + controls'] },
  { title: 'Quick access', target: [0.5, 0.50], items: ['8-tile grid', 'Temperature, Humidity, Fan, Reports', 'Smart Home, Savings, AI Tips, Settings'] },
  { title: 'AI optimization', target: [0.5, 0.90], items: ['AI is optimizing your comfort', 'Pre-cooling, savings, patterns learned'] },
]

const RIGHT_CALLOUTS = [
  { title: 'Fan Control', target: [0.28, 0.58], items: ['Quick access tile', 'Fan mode'] },
  { title: 'Reports', target: [0.72, 0.58], items: ['Quick access tile', 'Reports & analytics'] },
  { title: 'Savings', target: [0.28, 0.68], items: ['Quick access tile', 'Savings view'] },
  {
    title: 'AI Learning: Habits, preferences, seasonal patterns',
    target: [0.58, 0.65],
    items: [
      'Maximum comfort',
      'Time-of-Use pricing',
      'Humidification',
      'Predictive pre-conditioning',
      'Smart routines',
      'Demand Response',
    ],
  },
  { title: 'Settings', target: [0.72, 0.68], items: ['Quick access tile', 'App settings'] },
]

export default function DemosAnnotated() {
  const wrapRef = useRef(null)
  const phoneScreenRef = useRef(null)
  const leftCalloutRefs = useRef([])
  const rightCalloutRefs = useRef([])
  const [arrows, setArrows] = useState([])
  const [wrapSize, setWrapSize] = useState({ w: 1, h: 1 })

  function measure() {
    const wrap = wrapRef.current
    const screen = phoneScreenRef.current
    if (!wrap || !screen) return
    const wrapRect = wrap.getBoundingClientRect()
    const screenRect = screen.getBoundingClientRect()
    const list = []

    leftCalloutRefs.current.forEach((el, i) => {
      if (!el || i >= LEFT_CALLOUTS.length) return
      const r = el.getBoundingClientRect()
      const [tx, ty] = LEFT_CALLOUTS[i].target
      const startX = r.right - wrapRect.left
      const startY = r.top + r.height / 2 - wrapRect.top
      const endX = screenRect.left - wrapRect.left + screenRect.width * tx
      const endY = screenRect.top - wrapRect.top + screenRect.height * ty
      const pathD = `M ${startX} ${startY} L ${endX} ${startY} L ${endX} ${endY}`
      list.push({ pathD, side: 'left' })
    })

    rightCalloutRefs.current.forEach((el, i) => {
      if (!el || i >= RIGHT_CALLOUTS.length) return
      const r = el.getBoundingClientRect()
      const [tx, ty] = RIGHT_CALLOUTS[i].target
      const startX = r.left - wrapRect.left
      const startY = r.top + r.height / 2 - wrapRect.top
      const endX = screenRect.left - wrapRect.left + screenRect.width * tx
      const endY = screenRect.top - wrapRect.top + screenRect.height * ty
      const pathD = `M ${startX} ${startY} L ${endX} ${startY} L ${endX} ${endY}`
      list.push({ pathD, side: 'right' })
    })

    setWrapSize({ w: wrapRect.width, h: wrapRect.height })
    setArrows(list)
  }

  useLayoutEffect(() => {
    measure()
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <article className="demos-annotated-page">
      <div className="demos-annotated-toolbar">
        <Link to="/demos" className="demos-annotated-back">← Back to Demos</Link>
        <h1 className="demos-annotated-heading">SkyportHome — AI-Powered Climate Control (with callouts)</h1>
      </div>
      <div ref={wrapRef} className="demos-annotated-wrap demos-annotated-wrap--with-arrows">
        <div className="demos-annotated-left">
          {LEFT_CALLOUTS.map((callout, i) => (
            <div
              key={i}
              ref={(el) => { leftCalloutRefs.current[i] = el }}
              className="demos-callout demos-callout--left"
            >
              <h3 className="demos-callout-title">{callout.title}</h3>
              <ul className="demos-callout-list">
                {callout.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="demos-annotated-center">
          <div className="demos-annotated-image-wrap">
            <div ref={phoneScreenRef} className="demos-annotated-image-box">
              <img
                src="/images/demos/skyport-home-annotated.png"
                alt="SkyportHome — AI-Powered Climate Control (Monthly Savings, Comfort Score, temperature dial, Quick access, AI optimization)"
                className="demos-annotated-img"
              />
            </div>
            <p className="demos-annotated-image-label">SkyportHome</p>
          </div>
        </div>
        <div className="demos-annotated-right">
          {RIGHT_CALLOUTS.map((callout, i) => (
            <div
              key={i}
              ref={(el) => { rightCalloutRefs.current[i] = el }}
              className="demos-callout demos-callout--right"
            >
              <h3 className="demos-callout-title">{callout.title}</h3>
              <ul className="demos-callout-list">
                {callout.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* SVG overlay: arrows from callouts to app */}
        {arrows.length > 0 && (
          <svg
            className="demos-annotated-arrows"
            viewBox={`0 0 ${wrapSize.w} ${wrapSize.h}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <marker id="arrowhead-left" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--daikin-blue)" />
              </marker>
              <marker id="arrowhead-right" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
                <polygon points="10 0, 0 3.5, 10 7" fill="var(--daikin-blue)" />
              </marker>
            </defs>
            {arrows.map((a, i) => (
              <path
                key={i}
                d={a.pathD}
                className="demos-annotated-arrow-line"
                fill="none"
                markerEnd={a.side === 'left' ? 'url(#arrowhead-left)' : 'url(#arrowhead-right)'}
              />
            ))}
          </svg>
        )}
      </div>
    </article>
  )
}
