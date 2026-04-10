import { useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, Home } from 'lucide-react'

/** Matches SkyportCare map pin legend */
const MAP_PIN_STATUS = {
  critical: { label: 'Critical Error', fill: '#e53935' },
  attention: { label: 'Needs Attention', fill: '#ff9800' },
  minor: { label: 'Minor Error', fill: '#ffc107' },
  reminder: { label: 'Reminder', fill: '#2196f3' },
  ok: { label: 'OK', fill: '#2ecc71' },
  offline: { label: 'Offline', fill: '#bdbdbd' },
  noAccess: { label: 'No Access', fill: '#546e7a' },
}

const SUB_LABELS = {
  activated: 'Activated',
  expiringSoon: 'Expiring Soon',
  expired: 'Expired',
  homeSold: 'Home Sold',
}

const INITIAL_STATUS = {
  critical: true,
  attention: true,
  minor: true,
  reminder: true,
  ok: true,
  offline: true,
  noAccess: true,
}

const INITIAL_SUB = {
  activated: false,
  expiringSoon: false,
  expired: false,
  homeSold: false,
}

/** Product screenshot used as a reliable static map preview (see `public/care-demo/locations-map-static.png`). */
const LOCATIONS_MAP_IMAGE_SRC = `${import.meta.env.BASE_URL}care-demo/locations-map-static.png`

export default function CareDemoLocationsMap() {
  const [status, setStatus] = useState(() => ({ ...INITIAL_STATUS }))
  const [onlyMine, setOnlyMine] = useState(false)
  const [subChecks, setSubChecks] = useState(() => ({ ...INITIAL_SUB }))

  const toggleStatus = (key) => {
    setStatus((s) => ({ ...s, [key]: !s[key] }))
  }

  const toggleSub = (key) => {
    setSubChecks((s) => ({ ...s, [key]: !s[key] }))
  }

  return (
    <div className="care-demo-locations">
      <div className="care-demo-locations__map-wrap" aria-label="Service locations map (demo)">
        <img
          src={LOCATIONS_MAP_IMAGE_SRC}
          alt="United States map with colored customer location pins"
          className="care-demo-locations__map-image"
          decoding="async"
        />
      </div>

      <aside className="care-demo-locations__panel" aria-label="Location status filters">
        <h2 className="care-demo-locations__panel-title">Location Status</h2>

        <div className="care-demo-locations__section" role="group" aria-label="Status pins">
          {Object.entries(MAP_PIN_STATUS).map(([key, { label, fill }]) => (
            <label key={key} className="care-demo-locations__row">
              <input
                type="checkbox"
                className="care-demo-locations__checkbox"
                checked={status[key]}
                onChange={() => toggleStatus(key)}
              />
              <span className="care-demo-locations__pin-swatch" aria-hidden>
                <svg width={18} height={22} viewBox="0 0 24 30">
                  <path
                    d="M12 28 C12 28 22 14 22 9 C22 4.5 17.5 0 12 0 C6.5 0 2 4.5 2 9 C2 14 12 28 12 28 Z"
                    fill={fill}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                </svg>
              </span>
              <span className="care-demo-locations__row-label">{label}</span>
            </label>
          ))}
        </div>

        <div className="care-demo-locations__rule" role="separator" />

        <label className="care-demo-locations__row care-demo-locations__row--single">
          <input
            type="checkbox"
            className="care-demo-locations__checkbox"
            checked={onlyMine}
            onChange={() => setOnlyMine((v) => !v)}
          />
          <span className="care-demo-locations__row-label">Only my Customers</span>
        </label>

        <div className="care-demo-locations__rule" role="separator" />

        <div className="care-demo-locations__section" role="group" aria-label="Subscription and home">
          <label className="care-demo-locations__row">
            <input
              type="checkbox"
              className="care-demo-locations__checkbox"
              checked={subChecks.activated}
              onChange={() => toggleSub('activated')}
            />
            <span className="care-demo-locations__sub-icon care-demo-locations__sub-icon--ok" aria-hidden>
              <CheckCircle2 size={16} strokeWidth={2.25} />
            </span>
            <span className="care-demo-locations__row-label">{SUB_LABELS.activated}</span>
          </label>
          <label className="care-demo-locations__row">
            <input
              type="checkbox"
              className="care-demo-locations__checkbox"
              checked={subChecks.expiringSoon}
              onChange={() => toggleSub('expiringSoon')}
            />
            <span className="care-demo-locations__sub-icon care-demo-locations__sub-icon--clock" aria-hidden>
              <Clock size={16} strokeWidth={2.25} />
            </span>
            <span className="care-demo-locations__row-label">{SUB_LABELS.expiringSoon}</span>
          </label>
          <label className="care-demo-locations__row">
            <input
              type="checkbox"
              className="care-demo-locations__checkbox"
              checked={subChecks.expired}
              onChange={() => toggleSub('expired')}
            />
            <span className="care-demo-locations__sub-icon care-demo-locations__sub-icon--alert" aria-hidden>
              <AlertCircle size={16} strokeWidth={2.25} />
            </span>
            <span className="care-demo-locations__row-label">{SUB_LABELS.expired}</span>
          </label>
          <label className="care-demo-locations__row">
            <input
              type="checkbox"
              className="care-demo-locations__checkbox"
              checked={subChecks.homeSold}
              onChange={() => toggleSub('homeSold')}
            />
            <span className="care-demo-locations__sub-icon care-demo-locations__sub-icon--home" aria-hidden>
              <Home size={16} strokeWidth={2.25} />
            </span>
            <span className="care-demo-locations__row-label">{SUB_LABELS.homeSold}</span>
          </label>
        </div>

        <p className="care-demo-locations__hint">
          Demo — static map preview. Filters mirror production controls; the map image does not change with filters.
        </p>
      </aside>
    </div>
  )
}
