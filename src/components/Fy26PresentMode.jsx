import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './Fy26PresentMode.css'

function stripElementIds(root) {
  if (root.nodeType === Node.ELEMENT_NODE && root.id) root.removeAttribute('id')
  root.querySelectorAll?.('[id]').forEach((el) => el.removeAttribute('id'))
}

/**
 * DOM slice from this slide anchor to the next nav anchor (or end of section / block for last slide).
 */
function buildSlideRange(slides, index) {
  const cur = slides[index]
  const next = slides[index + 1]
  const startEl = document.getElementById(cur?.id)
  if (!startEl) return null

  const range = document.createRange()
  try {
    range.setStartBefore(startEl)
    if (next) {
      const endEl = document.getElementById(next.id)
      if (endEl) range.setEndBefore(endEl)
      else {
        const sec = startEl.closest('section.ds-section')
        if (sec?.lastElementChild) range.setEndAfter(sec.lastElementChild)
        else range.setEndAfter(startEl)
      }
    } else {
      const sec = startEl.closest('section.ds-section')
      if (sec?.lastElementChild) range.setEndAfter(sec.lastElementChild)
      else range.setEndAfter(startEl)
    }
  } catch {
    return null
  }
  return range
}

function mountSlideClone(host, slides, index) {
  if (!host) return
  host.textContent = ''
  const range = buildSlideRange(slides, index)
  if (!range) {
    const p = document.createElement('p')
    p.className = 'fy26-present-slide-fallback'
    p.textContent = 'This section is not on the page or has no anchor yet.'
    host.appendChild(p)
    return
  }

  let frag
  try {
    frag = range.cloneContents()
  } catch {
    const p = document.createElement('p')
    p.className = 'fy26-present-slide-fallback'
    p.textContent = 'Could not copy this section from the page.'
    host.appendChild(p)
    return
  }

  const wrapper = document.createElement('div')
  wrapper.className = 'fy26-page fy26-present-slide-clone-root'
  wrapper.appendChild(frag)
  stripElementIds(wrapper)
  host.appendChild(wrapper)
}

/**
 * Full-screen slide-style review of FY26 page sections (cloned live DOM, collapsibles expanded from parent).
 */
export function Fy26PresentMode({
  open,
  onClose,
  slides,
  deckTitle,
  installedFunnelLicenseBreakdownOpen,
  onInstalledFunnelLicenseBreakdownOpenChange,
}) {
  const titleId = useId()
  const [index, setIndex] = useState(0)
  const bodyHostRef = useRef(null)
  const [cloneTick, setCloneTick] = useState(0)

  const slide = slides[index]
  const total = slides.length
  const canPrev = index > 0
  const canNext = index < total - 1

  const remountClone = useCallback(() => {
    const host = bodyHostRef.current
    if (!host || !open || !slide) return
    mountSlideClone(host, slides, index)
  }, [open, slide, slides, index])

  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  /**
   * Re-clone after open / slide change. Parent expands collapsibles in layout effects; Recharts may
   * paint asynchronously — staggered timeouts refresh the clone until content stabilizes.
   */
  useEffect(() => {
    if (!open || !slide) return undefined
    let cancelled = false
    const run = () => {
      if (!cancelled) remountClone()
    }
    const delays = [0, 50, 150, 350, 600]
    const ids = delays.map((ms) => window.setTimeout(run, ms))
    return () => {
      cancelled = true
      ids.forEach((id) => window.clearTimeout(id))
    }
  }, [open, index, slide, slides, remountClone, cloneTick])

  useEffect(() => {
    if (!open) return undefined
    function onResize() {
      setCloneTick((n) => n + 1)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIndex((i) => Math.min(i + 1, total - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIndex((i) => Math.max(i - 1, 0))
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, total])

  if (!open) return null

  const isResultsChartsSlide = slide?.id === 'fy25-thermostat-sales-skyportcare'

  return createPortal(
    <div
      className="fy26-present-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="fy26-present-topbar">
        <p id={titleId} className="fy26-present-topbar-title">
          {deckTitle || 'FY26 playbook'} — present mode
        </p>
        <button type="button" className="fy26-present-close" onClick={onClose}>
          Close (Esc)
        </button>
      </div>
      <div className="fy26-present-stage">
        {slide && (
          <div
            className={`fy26-present-slide${isInstalledFunnelSlide ? ' fy26-present-slide--wide' : ''}`}
          >
            <p className="fy26-present-slide-num">
              Slide {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            <h2 className="fy26-present-slide-title">{slide.label}</h2>
            {isResultsChartsSlide &&
              onInstalledFunnelLicenseBreakdownOpenChange != null &&
              installedFunnelLicenseBreakdownOpen !== undefined && (
                <div className="fy26-present-funnel-breakdown-bar">
                  <button
                    type="button"
                    className="fy26-present-funnel-breakdown-bar-btn"
                    onClick={() =>
                      onInstalledFunnelLicenseBreakdownOpenChange(!installedFunnelLicenseBreakdownOpen)
                    }
                  >
                    {installedFunnelLicenseBreakdownOpen
                      ? 'Hide Active License type breakdown'
                      : 'Show Active License type breakdown'}
                  </button>
                </div>
              )}
            <div
              ref={bodyHostRef}
              className={`fy26-present-slide-body fy26-present-slide-body--html${
                isResultsChartsSlide ? ' fy26-present-slide-body--installed-funnel' : ''
              }`}
              tabIndex={0}
            />
          </div>
        )}
      </div>
      <div className="fy26-present-footer">
        <button
          type="button"
          className="fy26-present-nav-btn"
          disabled={!canPrev}
          onClick={() => setIndex((i) => i - 1)}
        >
          Previous
        </button>
        <span className="fy26-present-counter">
          {index + 1} / {total}
          <span className="fy26-present-hint"> · ← → keys</span>
        </span>
        <button
          type="button"
          className="fy26-present-nav-btn"
          disabled={!canNext}
          onClick={() => setIndex((i) => i + 1)}
        >
          Next
        </button>
      </div>
    </div>,
    document.body,
  )
}
