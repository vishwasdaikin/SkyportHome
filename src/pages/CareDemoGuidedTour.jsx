import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { careDemoTourCopy } from '../constants/careDemoTours'
import './CareDemoGuidedTour.css'

/**
 * Viewport size in the same CSS pixel space as `getBoundingClientRect()` on page content
 * (prefer `documentElement.getBoundingClientRect()` over innerWidth — avoids clip-path / zoom drift).
 */
function getLayoutViewportSize() {
  if (typeof window === 'undefined') return { w: 1200, h: 800 }
  const root = document.documentElement
  const br = root.getBoundingClientRect()
  const w = br.width > 1 ? br.width : root.clientWidth ?? window.innerWidth
  const h = br.height > 1 ? br.height : root.clientHeight ?? window.innerHeight
  return { w: Math.max(1, w), h: Math.max(1, h) }
}

/** Four fixed panels = “hole” without clip-path (stable when browser zoom changes). */
function SpotlightShades({ rect }) {
  const { w: vw, h: vh } = getLayoutViewportSize()
  if (!rect || rect.width < 2 || rect.height < 2) {
    return <div className="care-demo-guided-tour__shade care-demo-guided-tour__shade--fullscreen" aria-hidden />
  }
  const pad = 10
  const L = Math.max(0, rect.left - pad)
  const T = Math.max(0, rect.top - pad)
  const R = Math.min(vw, rect.left + rect.width + pad)
  const B = Math.min(vh, rect.top + rect.height + pad)
  const midH = Math.max(0, B - T)
  return (
    <>
      {T > 0 ? (
        <div className="care-demo-guided-tour__shade" style={{ left: 0, top: 0, width: vw, height: T }} aria-hidden />
      ) : null}
      {midH > 0 && L > 0 ? (
        <div className="care-demo-guided-tour__shade" style={{ left: 0, top: T, width: L, height: midH }} aria-hidden />
      ) : null}
      {midH > 0 && R < vw ? (
        <div
          className="care-demo-guided-tour__shade"
          style={{ left: R, top: T, width: Math.max(0, vw - R), height: midH }}
          aria-hidden
        />
      ) : null}
      {B < vh ? (
        <div
          className="care-demo-guided-tour__shade"
          style={{ left: 0, top: B, width: vw, height: Math.max(0, vh - B) }}
          aria-hidden
        />
      ) : null}
    </>
  )
}

function useHighlightRect(selector, active) {
  const [rect, setRect] = useState(null)
  const rafAfterLayoutRef = useRef(0)

  const measure = useCallback(() => {
    if (!active || !selector) {
      setRect(null)
      return
    }
    const el = document.querySelector(selector)
    if (!el || !(el instanceof HTMLElement)) {
      setRect(null)
      return
    }
    const r = el.getBoundingClientRect()
    setRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    })
  }, [active, selector])

  useLayoutEffect(() => {
    measure()
  }, [measure])

  useEffect(() => {
    if (!active) return

    const scheduleMeasureAfterLayout = () => {
      if (rafAfterLayoutRef.current) cancelAnimationFrame(rafAfterLayoutRef.current)
      rafAfterLayoutRef.current = requestAnimationFrame(() => {
        rafAfterLayoutRef.current = 0
        measure()
      })
    }

    measure()

    const onScroll = () => measure()
    const onResize = () => scheduleMeasureAfterLayout()

    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    const onWheelZoom = (e) => {
      if (e.ctrlKey) scheduleMeasureAfterLayout()
    }
    window.addEventListener('wheel', onWheelZoom, { passive: true })
    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', onResize)
      vv.addEventListener('scroll', onScroll)
    }

    let resizeObserver = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => scheduleMeasureAfterLayout())
      resizeObserver.observe(document.documentElement)
    }

    const id = window.setInterval(measure, 400)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('wheel', onWheelZoom)
      if (vv) {
        vv.removeEventListener('resize', onResize)
        vv.removeEventListener('scroll', onScroll)
      }
      if (resizeObserver) resizeObserver.disconnect()
      if (rafAfterLayoutRef.current) cancelAnimationFrame(rafAfterLayoutRef.current)
      window.clearInterval(id)
    }
  }, [active, measure])

  useEffect(() => {
    if (!active || !selector) return
    if (typeof ResizeObserver === 'undefined') return
    const el = document.querySelector(selector)
    if (!el || !(el instanceof HTMLElement)) return
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => measure())
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [active, selector, measure])

  return rect
}

/**
 * Spotlight + tooltip for Care Demo guided tours.
 */
export default function CareDemoGuidedTour({
  active,
  tourId,
  step,
  setStep,
  onExit,
  /** Called only when the user finishes the last step (“Done”), not Skip or Escape. */
  onCompleteTour,
  onOpenTourStep1Modal,
  onCloseTourStep1ModalForBack,
}) {
  const def = tourId ? careDemoTourCopy[tourId] : null
  const steps = def?.steps ?? []
  const safeStep = Math.min(Math.max(0, step), Math.max(0, steps.length - 1))
  const stepDef = steps[safeStep] ?? null

  const effectiveStepIndex = safeStep
  const effectiveDef = steps[effectiveStepIndex] ?? stepDef

  const selector = effectiveDef?.targetSelector ?? ''
  const secondaryHighlightSelector = effectiveDef?.secondaryHighlightSelector ?? ''
  const tooltipDockSelector = (effectiveDef?.tooltipDockSelector ?? '').trim()
  const tooltipOnly = Boolean(effectiveDef?.tooltipOnly)
  const dimFullscreen = Boolean(effectiveDef?.dimFullscreen && tooltipOnly)
  const showSpotlight = active && Boolean(effectiveDef) && !tooltipOnly

  const referenceImageUrl = effectiveDef?.referenceImageFile
    ? `${(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')}${effectiveDef.referenceImageFile.replace(/^\//, '')}`
    : null

  const rect = useHighlightRect(selector, active && Boolean(selector) && Boolean(effectiveDef))
  const rectSecondary = useHighlightRect(
    secondaryHighlightSelector,
    active && showSpotlight && Boolean(secondaryHighlightSelector),
  )
  const rectDockSeparate = useHighlightRect(
    tooltipDockSelector,
    active &&
      showSpotlight &&
      Boolean(tooltipDockSelector) &&
      tooltipDockSelector !== secondaryHighlightSelector,
  )

  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onExit])

  if (!active || !tourId || !def || !effectiveDef) return null

  const { w: vw, h: vh } = getLayoutViewportSize()

  const total = steps.length
  const atFirst = effectiveStepIndex <= 0
  const atLast = effectiveStepIndex >= total - 1

  const goBack = () => {
    if (effectiveStepIndex <= 0) return
    if (effectiveStepIndex === 1) {
      if (!def.skipCloseModalWhenBackFromStep1) {
        onCloseTourStep1ModalForBack()
      }
      setStep(0)
      return
    }
    setStep(effectiveStepIndex - 1)
  }

  const goNext = () => {
    if (effectiveStepIndex >= total - 1) {
      onCompleteTour?.()
      onExit()
      return
    }
    if (effectiveStepIndex === 0) {
      if (!def.skipOpenModalOnFirstNext) {
        onOpenTourStep1Modal()
      }
      setStep(1)
      return
    }
    setStep(effectiveStepIndex + 1)
  }

  /** Prefer docking beside a small CTA (`tooltipDockSelector`) when the spotlight target spans most of the viewport. */
  const rectForTooltipDock =
    tooltipDockSelector && tooltipDockSelector === secondaryHighlightSelector
      ? rectSecondary
      : rectDockSeparate

  const anchorRect = (() => {
    if (!showSpotlight) return null
    if (!rect || rect.width < 2 || rect.height < 2) return null
    if (!tooltipDockSelector) return rect
    if (rectForTooltipDock && rectForTooltipDock.width >= 2 && rectForTooltipDock.height >= 2) {
      return rectForTooltipDock
    }
    return null
  })()

  const dockBelowPrimary = Boolean(effectiveDef?.dockTooltipBelowPrimary)
  const dockTrailingPrimary = Boolean(effectiveDef?.dockTooltipTrailingPrimary)

  /** Fixed frame for the tooltip: beside a CTA, below primary, or trailing the primary (modal + gap). */
  const tooltipFrameRect = (() => {
    if (!showSpotlight) return null
    if (
      dockBelowPrimary &&
      rect &&
      rect.width >= 2 &&
      rect.height >= 2 &&
      rectForTooltipDock &&
      rectForTooltipDock.width >= 2 &&
      rectForTooltipDock.height >= 2
    ) {
      const belowGap = Number.isFinite(Number(effectiveDef.dockTooltipBelowPrimaryGap))
        ? Number(effectiveDef.dockTooltipBelowPrimaryGap)
        : 12
      const panelW = Math.min(420, vw - 24)
      const btnCx = rectForTooltipDock.left + rectForTooltipDock.width / 2
      const left = Math.max(12, Math.min(btnCx - panelW / 2, vw - panelW - 12))
      return {
        top: rect.top + rect.height + belowGap,
        left,
        width: panelW,
        height: 2,
      }
    }
    if (dockTrailingPrimary && rect && rect.width >= 2 && rect.height >= 2) {
      const trailGap = Number.isFinite(Number(effectiveDef.dockTooltipTrailingGap))
        ? Number(effectiveDef.dockTooltipTrailingGap)
        : 20
      const margin = 12
      const minPanel = 220
      const maxPanel = 420
      const spaceRight = vw - (rect.left + rect.width + trailGap) - margin
      const spaceLeft = rect.left - trailGap - margin

      let trailSide = 'right'
      let panelW
      let left

      if (spaceRight >= minPanel) {
        trailSide = 'right'
        panelW = Math.min(maxPanel, spaceRight)
        left = rect.left + rect.width + trailGap
      } else if (spaceLeft >= minPanel) {
        trailSide = 'left'
        panelW = Math.min(maxPanel, spaceLeft)
        left = rect.left - trailGap - panelW
        if (left < margin) {
          left = margin
          panelW = Math.min(maxPanel, Math.max(minPanel, rect.left - trailGap - margin))
        }
      } else {
        trailSide = 'right'
        panelW = Math.max(200, Math.min(maxPanel, Math.max(spaceRight, 160)))
        left = Math.min(rect.left + rect.width + trailGap, vw - panelW - margin)
      }

      return {
        top: rect.top,
        left,
        width: Math.max(200, panelW),
        height: rect.height,
        trailSide,
        trailAlignTop: Boolean(effectiveDef?.dockTooltipTrailingAlignTop),
      }
    }
    return anchorRect
  })()

  /**
   * Beside-dock uses `left: 100%` on the anchor. Near–full-width targets (e.g. Customers hub root)
   * push the tour panel entirely off-screen — fall back to default bottom-centered tooltip.
   */
  const maxBesideAnchorWidthRatio = 0.44
  const tooltipFrameRectForDock =
    tooltipFrameRect &&
    !dockBelowPrimary &&
    !dockTrailingPrimary &&
    !effectiveDef?.roleMatrix &&
    tooltipFrameRect.width > vw * maxBesideAnchorWidthRatio
      ? null
      : tooltipFrameRect

  /** Tooltip docked inside a fixed box aligned to `tooltipFrameRectForDock` (viewport px). */
  const dockInAnchor = Boolean(
    tooltipFrameRectForDock && tooltipFrameRectForDock.width >= 2 && tooltipFrameRectForDock.height >= 2,
  )
  const gap = 28
  const estPanelW = effectiveDef.roleMatrix ? 560 : 420
  const minPanelSideSpace = 260
  /* Horizontal space beside anchor (px). Tooltip ~min(estPanelW, 420) wide + margins. */
  const spaceRight =
    dockInAnchor && !dockBelowPrimary && !dockTrailingPrimary
      ? vw - (tooltipFrameRectForDock.left + tooltipFrameRectForDock.width) - gap - 12
      : 0
  const spaceLeft =
    dockInAnchor && !dockBelowPrimary && !dockTrailingPrimary ? tooltipFrameRectForDock.left - gap - 12 : 0
  const needPanelW = Math.min(estPanelW, 420)
  /* Prefer right; flip left only when the right side is too tight and the left side is better. */
  let flipBesideLeft =
    dockInAnchor &&
    !dockBelowPrimary &&
    !dockTrailingPrimary &&
    !effectiveDef?.roleMatrix &&
    spaceRight < needPanelW &&
    spaceLeft >= minPanelSideSpace &&
    spaceLeft > spaceRight

  if (
    dockInAnchor &&
    !dockBelowPrimary &&
    !dockTrailingPrimary &&
    !effectiveDef?.roleMatrix &&
    spaceRight < needPanelW &&
    spaceLeft < minPanelSideSpace
  ) {
    flipBesideLeft = false
  }

  /** Only cap height from anchor top; do not clamp width — narrow dock anchors (e.g. Review Order) made the panel long/skinny. */
  const dockTooltipStyle = {}
  if (dockInAnchor && tooltipFrameRectForDock) {
    if (dockTrailingPrimary) {
      dockTooltipStyle.maxHeight = Math.max(
        140,
        Math.min(
          560,
          tooltipFrameRectForDock.height - 12,
          vh - tooltipFrameRectForDock.top - 12,
        ),
      )
    } else {
      dockTooltipStyle.maxHeight = Math.max(
        140,
        Math.min(560, vh - tooltipFrameRectForDock.top - 12),
      )
    }
  }

  const tooltipClassName = [
    'care-demo-guided-tour__tooltip',
    effectiveDef.roleMatrix ? 'care-demo-guided-tour__tooltip--wide' : '',
    referenceImageUrl ? 'care-demo-guided-tour__tooltip--reference' : '',
    referenceImageUrl && effectiveDef?.referenceImageHalfSize ? 'care-demo-guided-tour__tooltip--reference-half' : '',
    dockInAnchor ? 'care-demo-guided-tour__tooltip--dock-anchor' : '',
    dockInAnchor && dockBelowPrimary ? 'care-demo-guided-tour__tooltip--dock-below' : '',
    dockInAnchor && dockTrailingPrimary && tooltipFrameRectForDock?.trailSide === 'left'
      ? 'care-demo-guided-tour__tooltip--dock-trailing-left'
      : '',
    dockInAnchor && dockTrailingPrimary && tooltipFrameRectForDock?.trailSide !== 'left'
      ? 'care-demo-guided-tour__tooltip--dock-trailing'
      : '',
    dockInAnchor && dockTrailingPrimary && tooltipFrameRectForDock?.trailAlignTop
      ? 'care-demo-guided-tour__tooltip--dock-trail-top'
      : '',
    dockInAnchor &&
      !dockBelowPrimary &&
      !dockTrailingPrimary &&
      (flipBesideLeft ? 'care-demo-guided-tour__tooltip--beside-left' : 'care-demo-guided-tour__tooltip--beside-right'),
  ]
    .filter(Boolean)
    .join(' ')

  const tooltipPanel = (
    <div
      className={tooltipClassName}
      style={Object.keys(dockTooltipStyle).length ? dockTooltipStyle : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="care-demo-guided-tour-title"
    >
        {def.title?.trim() ? <p className="care-demo-guided-tour__eyebrow">{def.title}</p> : null}
        <h2
          id="care-demo-guided-tour-title"
          className={`care-demo-guided-tour__title${effectiveStepIndex === 0 ? ' care-demo-guided-tour__title--plain' : ''}`}
        >
          {effectiveDef.title}
        </h2>
        {effectiveDef.body?.trim() ? (
          <p className="care-demo-guided-tour__body">{effectiveDef.body}</p>
        ) : null}
        {referenceImageUrl ? (
          <figure className="care-demo-guided-tour__reference">
            <img
              src={referenceImageUrl}
              alt={effectiveDef.referenceImageCaption || 'Dealer Help Guide reference'}
              className="care-demo-guided-tour__reference-img"
              decoding="async"
              loading="eager"
            />
            {effectiveDef.referenceImageCaption ? (
              <figcaption className="care-demo-guided-tour__reference-cap">{effectiveDef.referenceImageCaption}</figcaption>
            ) : null}
          </figure>
        ) : null}
        {effectiveDef.roleMatrix?.rows?.length ? (
          <div className="care-demo-guided-tour__matrix-wrap">
            <table className="care-demo-guided-tour__matrix" role="grid" aria-label="Member role permissions">
              <thead>
                <tr>
                  <th scope="col" className="care-demo-guided-tour__matrix-corner">
                    Permission
                  </th>
                  <th scope="col">Installer</th>
                  <th scope="col">Tech</th>
                  <th scope="col">Admin</th>
                </tr>
              </thead>
              <tbody>
                {effectiveDef.roleMatrix.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="care-demo-guided-tour__matrix-rowhead">
                      {row.label}
                    </th>
                    <td className="care-demo-guided-tour__matrix-cell">
                      {row.installer ? (
                        <span className="care-demo-guided-tour__check" aria-label="Yes">
                          ✓
                        </span>
                      ) : (
                        <span className="care-demo-guided-tour__dash" aria-label="No">
                          —
                        </span>
                      )}
                    </td>
                    <td className="care-demo-guided-tour__matrix-cell">
                      {row.tech ? (
                        <span className="care-demo-guided-tour__check" aria-label="Yes">
                          ✓
                        </span>
                      ) : (
                        <span className="care-demo-guided-tour__dash" aria-label="No">
                          —
                        </span>
                      )}
                    </td>
                    <td className="care-demo-guided-tour__matrix-cell">
                      {row.admin ? (
                        <span className="care-demo-guided-tour__check" aria-label="Yes">
                          ✓
                        </span>
                      ) : (
                        <span className="care-demo-guided-tour__dash" aria-label="No">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <div className="care-demo-guided-tour__actions">
          <span className="care-demo-guided-tour__progress">
            {effectiveStepIndex + 1} / {total}
          </span>
          <button type="button" className="care-demo-guided-tour__btn" onClick={onExit}>
            Skip tour
          </button>
          {!atFirst ? (
            <button type="button" className="care-demo-guided-tour__btn" onClick={goBack}>
              Back
            </button>
          ) : null}
          <button
            type="button"
            className="care-demo-guided-tour__btn care-demo-guided-tour__btn--primary"
            onClick={goNext}
          >
            {atLast ? 'Done' : 'Next'}
          </button>
        </div>
    </div>
  )

  const ui = (
    <>
      {showSpotlight ? (
        <SpotlightShades rect={rect} />
      ) : dimFullscreen ? (
        <div className="care-demo-guided-tour__shade care-demo-guided-tour__shade--fullscreen" aria-hidden />
      ) : (
        <div
          className="care-demo-guided-tour__shade care-demo-guided-tour__shade--fullscreen care-demo-guided-tour__shade--hidden"
          aria-hidden
        />
      )}
      {showSpotlight &&
      rectSecondary &&
      secondaryHighlightSelector &&
      rectSecondary.width >= 2 &&
      rectSecondary.height >= 2 ? (
        <div
          className="care-demo-guided-tour__accent-ring"
          style={{
            top: rectSecondary.top - 5,
            left: rectSecondary.left - 5,
            width: rectSecondary.width + 10,
            height: rectSecondary.height + 10,
          }}
          aria-hidden
        />
      ) : null}
      {dockInAnchor && tooltipFrameRectForDock ? (
        <div
          className="care-demo-guided-tour__anchor"
          style={{
            top: tooltipFrameRectForDock.top,
            left: tooltipFrameRectForDock.left,
            width: tooltipFrameRectForDock.width,
            height: tooltipFrameRectForDock.height,
          }}
        >
          {tooltipPanel}
        </div>
      ) : (
        tooltipPanel
      )}
    </>
  )

  return createPortal(ui, document.body)
}
