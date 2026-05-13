import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import CareDemoHelpContent from './CareDemoHelpContent.jsx'
import './CareDemoHelpModal.css'

export default function CareDemoHelpModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const modal = (
    <div
      className="care-demo-help__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-demo-help-h1"
        id="care-demo-help-dialog"
        className="care-demo-help"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="care-demo-help__head">
          <h1 id="care-demo-help-h1" className="care-demo-help__h1">
            Help
          </h1>
          <button type="button" className="care-demo-help__close" aria-label="Close help" onClick={onClose}>
            <X size={22} strokeWidth={2} />
          </button>
        </header>
        <div className="care-demo-help__scroll">
          <CareDemoHelpContent variant="modal" />
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
