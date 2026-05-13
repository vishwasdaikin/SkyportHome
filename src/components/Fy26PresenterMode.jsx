import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Fy25ThermostatSalesDualChartsRow,
  Fy25SkyportCareDualChartsRow,
  ThermostatFunnelHardwareTable,
  SkyportCareFunnelActivationTable,
  SKYPORTHOME_ALL_TIME_VALUE,
  THERMOSTAT_FY_TABS,
  FY25_REVIEW_DEFAULT_FY_TAB,
} from '../pages/FY26'
import './Fy26PresenterMode.css'

/* Top-level "Present" button rendered next to Download PDF on Digital Apps & Services. */
export function Fy26PresentButton({ onClick }) {
  return (
    <button
      type="button"
      className="fy26-present-btn"
      onClick={onClick}
      title="Open a full-screen slideshow of the FY25 Review key results."
      aria-label="Open FY25 Review presenter mode"
    >
      <svg
        className="fy26-present-btn-icon"
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth={2} />
        <path
          d="M9 21h6M12 17v4"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Present</span>
    </button>
  )
}

/* Slide registry — kept inline so all slides can be tuned in one place. */
function buildSlides({ payload, allTimeFunnel, thermostatTabId, setThermostatTabId, skyportCareTabId, setSkyportCareTabId }) {
  return [
    {
      id: 'title',
      kind: 'title',
      label: 'Title',
      render: () => <TitleSlide />,
    },
    {
      id: 'thermostats',
      kind: 'charts',
      label: 'Thermostats',
      render: () => (
        <ThermostatsSlide
          payload={payload}
          allTimeFunnel={allTimeFunnel}
          chartTabId={thermostatTabId}
          setChartTabId={setThermostatTabId}
        />
      ),
    },
    {
      id: 'skyport-home',
      kind: 'stat',
      label: 'SkyportHome',
      render: () => <SkyportHomeSlide />,
    },
    {
      id: 'skyport-care',
      kind: 'charts',
      label: 'SkyportCare',
      render: () => (
        <SkyportCareSlide
          allTimeFunnel={allTimeFunnel}
          chartTabId={skyportCareTabId}
          setChartTabId={setSkyportCareTabId}
        />
      ),
    },
    {
      id: 'takeaway',
      kind: 'takeaway',
      label: 'Takeaway',
      render: () => <TakeawaySlide />,
    },
  ]
}

function TitleSlide() {
  const today = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }, [])
  return (
    <>
      <p className="fy26-presenter-title-eyebrow">FY26 Playbook · Digital Apps &amp; Services</p>
      <h1 className="fy26-presenter-title-heading">FY25 Review — Results</h1>
      <p className="fy26-presenter-title-subtitle">
        Thermostats, SkyportHome, and SkyportCare in one quick deck.
      </p>
      <div className="fy26-presenter-title-meta">
        <span className="fy26-presenter-title-meta-chip">Live data</span>
        <span>{today}</span>
      </div>
      <p className="fy26-presenter-title-hint">Press → or Space to begin</p>
    </>
  )
}

function ThermostatsSlide({ payload, allTimeFunnel, chartTabId, setChartTabId }) {
  return (
    <>
      <p className="fy26-presenter-slide-eyebrow">FY25 Review · Thermostats</p>
      <h2 className="fy26-presenter-slide-title">Thermostats: Sales &amp; Wi-Fi Connected</h2>
      <div className="fy26-presenter-slide-body fy26-presenter-slide-body--charts">
        {allTimeFunnel ? <ThermostatFunnelHardwareTable allTimeFunnel={allTimeFunnel} /> : null}
        <Fy25ThermostatSalesDualChartsRow
          chartTabId={chartTabId}
          setChartTabId={setChartTabId}
          idSuffix="-presenter"
          tablistAriaLabel="Fiscal year"
          monthlyShowActiveLicenses={false}
          allTimeChartSimplified
          fyChartData={payload?.thermostatSalesChartData}
          allTimeQuarterlyData={payload?.allTimeRightQuarterlySpan}
        />
      </div>
    </>
  )
}

function SkyportHomeSlide() {
  return (
    <>
      <p className="fy26-presenter-slide-eyebrow">FY25 Review · SkyportHome</p>
      <h2 className="fy26-presenter-slide-title">SkyportHome reach &amp; engagement</h2>
      <div className="fy26-presenter-slide-body">
        <div className="fy26-presenter-stat-row">
          <div className="fy26-presenter-stat-card">
            <span className="fy26-presenter-stat-card-label">Current SkyportHome users</span>
            <span className="fy26-presenter-stat-card-value">
              ~{SKYPORTHOME_ALL_TIME_VALUE.toLocaleString('en-US')}
            </span>
            <span className="fy26-presenter-stat-card-sub">93% of Wi-Fi connected thermostats</span>
          </div>
          <div className="fy26-presenter-stat-card">
            <span className="fy26-presenter-stat-card-label">Engagement instrumentation</span>
            <span className="fy26-presenter-stat-card-value" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)' }}>
              Not yet wired
            </span>
            <span className="fy26-presenter-stat-card-sub">
              MAU and user-action analytics planned for FY26.
            </span>
          </div>
        </div>
        <ul className="fy26-presenter-skyporthome-summary">
          <li>
            Strong installed base translates into a large potential SkyportHome audience — most Wi-Fi
            connected thermostats already register a SkyportHome account.
          </li>
          <li>
            Public reviews and support feedback flag reliability and onboarding friction as the top
            barriers to deeper engagement.
          </li>
          <li>
            FY26 priority: instrument MAU + user actions and resolve recurring UX issues so reach
            converts into recurring use.
          </li>
        </ul>
      </div>
    </>
  )
}

function SkyportCareSlide({ allTimeFunnel, chartTabId, setChartTabId }) {
  return (
    <>
      <p className="fy26-presenter-slide-eyebrow">FY25 Review · SkyportCare</p>
      <h2 className="fy26-presenter-slide-title">SkyportCare licenses &amp; activation</h2>
      <div className="fy26-presenter-slide-body fy26-presenter-slide-body--charts">
        {allTimeFunnel ? (
          <SkyportCareFunnelActivationTable
            allTimeFunnel={allTimeFunnel}
            licenseBreakdownOpen={false}
            onLicenseBreakdownOpenChange={() => {}}
          />
        ) : null}
        <Fy25SkyportCareDualChartsRow
          chartTabId={chartTabId}
          setChartTabId={setChartTabId}
          idSuffix="-presenter-skyport-care"
          tablistAriaLabel="Fiscal year, SkyportCare monthly active licenses"
          omitLicenseRenewalsInstrumentationNote
        />
      </div>
    </>
  )
}

function TakeawaySlide() {
  return (
    <>
      <p className="fy26-presenter-slide-eyebrow">FY25 Review · Summary</p>
      <h2 className="fy26-presenter-slide-title">Key takeaways</h2>
      <div className="fy26-presenter-slide-body fy26-presenter-slide-body--takeaway">
        <div className="fy26-presenter-takeaway-card">
          <span className="fy26-presenter-takeaway-label">Thermostats:</span>
          FY25 continued strong volume growth, but a decline in connection rate exposes activation
          and commissioning gaps. Improving install-time connectivity is the single biggest lever to
          realize digital value from the installed base.
        </div>
        <div className="fy26-presenter-takeaway-card">
          <span className="fy26-presenter-takeaway-label">SkyportHome:</span>
          Reach is meaningful, but unresolved reliability and UX issues dominate user feedback.
          Improving core experience quality and instrumenting engagement is critical before driving
          deeper homeowner activation.
        </div>
        <div className="fy26-presenter-takeaway-card">
          <span className="fy26-presenter-takeaway-label">SkyportCare:</span>
          Steady license growth, but penetration relative to the installed hardware base remains
          low. Closing the activation gap is the primary lever to convert connected systems into
          recurring digital value.
        </div>
      </div>
    </>
  )
}

export default function Fy26PresenterMode({ open, onClose, payload, allTimeFunnel, returnFocusRef }) {
  const overlayRef = useRef(null)
  const closeBtnRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [thermostatTabId, setThermostatTabId] = useState(FY25_REVIEW_DEFAULT_FY_TAB)
  const [skyportCareTabId, setSkyportCareTabId] = useState(FY25_REVIEW_DEFAULT_FY_TAB)

  const slides = useMemo(
    () =>
      buildSlides({
        payload,
        allTimeFunnel,
        thermostatTabId,
        setThermostatTabId,
        skyportCareTabId,
        setSkyportCareTabId,
      }),
    [payload, allTimeFunnel, thermostatTabId, skyportCareTabId],
  )

  const goNext = useCallback(() => {
    setIndex((i) => (i < slides.length - 1 ? i + 1 : i))
  }, [slides.length])

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i))
  }, [])

  const goFirst = useCallback(() => setIndex(0), [])
  const goLast = useCallback(() => setIndex(slides.length - 1), [slides.length])

  useEffect(() => {
    if (!open) return undefined
    setIndex(0)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const focusTarget = closeBtnRef.current
    const previouslyFocused = document.activeElement
    if (focusTarget) focusTarget.focus()
    return () => {
      const target = returnFocusRef?.current ?? previouslyFocused
      if (target && typeof target.focus === 'function') {
        target.focus()
      }
    }
  }, [open, returnFocusRef])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        goNext()
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        goPrev()
        return
      }
      if (e.key === ' ') {
        e.preventDefault()
        if (e.shiftKey) goPrev()
        else goNext()
        return
      }
      if (e.key === 'Backspace') {
        e.preventDefault()
        goPrev()
        return
      }
      if (e.key === 'Home') {
        e.preventDefault()
        goFirst()
        return
      }
      if (e.key === 'End') {
        e.preventDefault()
        goLast()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, goNext, goPrev, goFirst, goLast, onClose])

  if (!open) return null
  if (typeof document === 'undefined') return null

  const slide = slides[index]
  const slideClass = `fy26-presenter-slide fy26-presenter-slide--${slide.kind}`

  return createPortal(
    <div
      ref={overlayRef}
      className="fy26-presenter"
      role="dialog"
      aria-modal="true"
      aria-label="FY25 Review presenter"
    >
      <div className="fy26-presenter-topbar">
        <p className="fy26-presenter-topbar-title">
          FY25 Review · slide {index + 1} of {slides.length}
        </p>
        <button
          ref={closeBtnRef}
          type="button"
          className="fy26-presenter-close"
          onClick={() => onClose?.()}
          aria-label="Close presenter (Esc)"
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
          <span>Close</span>
        </button>
      </div>

      <div className="fy26-presenter-stage">
        <section className={slideClass} aria-labelledby="fy26-presenter-active-slide">
          <span id="fy26-presenter-active-slide" className="sr-only">
            {slide.label}
          </span>
          {slide.render()}
        </section>
      </div>

      <div className="fy26-presenter-bottom">
        <div className="fy26-presenter-controls">
          <button
            type="button"
            className="fy26-presenter-nav-btn"
            onClick={goPrev}
            disabled={index === 0}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="fy26-presenter-counter">
            {index + 1} / {slides.length}
          </span>
          <button
            type="button"
            className="fy26-presenter-nav-btn"
            onClick={goNext}
            disabled={index === slides.length - 1}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="fy26-presenter-dots" role="tablist" aria-label="Slides">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}: ${s.label}`}
              className={`fy26-presenter-dot ${i === index ? 'fy26-presenter-dot--active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="fy26-presenter-key-hint">Arrow keys · Space · Esc to exit</div>
      </div>
    </div>,
    document.body,
  )
}
