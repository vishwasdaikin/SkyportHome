import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, PlayCircle } from 'lucide-react'
import { CARE_DEMO_GUIDED_TOUR_OPTIONS } from '../constants/careDemoTours.js'

/**
 * Guided Tours dropdown (topbar + dashboard). Each instance manages its own open state.
 */
export default function CareDemoGuidedToursMenu({ variant = 'topbar', onSelectTour, onOpenChange }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    onOpenChange?.(open)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) return
    const onDocDown = (e) => {
      const t = e.target
      if (!(t instanceof Element)) return
      if (wrapRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const triggerClass =
    variant === 'topbar'
      ? 'care-demo__guided-tours-trigger care-demo__guided-tours-trigger--topbar'
      : 'care-demo__guided-tours-trigger care-demo__guided-tours-trigger--dashboard'

  return (
    <div
      className={`care-demo__guided-tours-wrap${variant === 'topbar' ? ' care-demo__guided-tours-wrap--topbar' : ''}`}
      ref={wrapRef}
    >
      <button
        type="button"
        className={triggerClass}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {variant === 'topbar' ? (
          <PlayCircle size={18} strokeWidth={2.25} className="care-demo__guided-tours-trigger-icon" aria-hidden />
        ) : null}
        <span className="care-demo__guided-tours-trigger-label">Guided tours</span>
        <ChevronDown
          size={variant === 'topbar' ? 16 : 18}
          strokeWidth={2.25}
          className={`care-demo__guided-tours-chevron${open ? ' care-demo__guided-tours-chevron--open' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={menuId} className="care-demo__guided-tours-menu" role="menu" aria-label="Guided tours">
          {CARE_DEMO_GUIDED_TOUR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="menuitem"
              className="care-demo__guided-tours-menu-item"
              onClick={() => {
                setOpen(false)
                onSelectTour(opt.id)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
