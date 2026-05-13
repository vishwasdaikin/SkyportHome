import './SkyportEnergy.css'

const VPP_PDF = 'Skyport-Energy-VPP-Process.pdf'
const DAIKIN_VPP_PDF = 'Skyport-Energy-Role-of-Daikin-in-VPP.pdf'

/** Absolute URL to a file in /public (works with Vite `base`). */
function publicAssetUrl(filename) {
  const base = import.meta.env.BASE_URL || '/'
  if (typeof window === 'undefined') {
    const root = base.endsWith('/') ? base : `${base}/`
    return `${root}${filename.replace(/^\//, '')}`
  }
  const root = new URL(base, window.location.origin)
  return new URL(filename.replace(/^\//, ''), root).href
}

/**
 * PDF: viewer on HTTPS (avoids SPA serving HTML); direct URL on localhost/http.
 */
function officeViewUrl(filename) {
  const fileUrl = publicAssetUrl(filename)
  if (typeof window === 'undefined') return fileUrl
  const { hostname, protocol } = window.location
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'
  if (isLocal || protocol !== 'https:') return fileUrl
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`
}

export default function SkyportEnergy() {
  return (
    <article className="skyport-energy-page">
      <header className="skyport-energy-header">
        <h1>SkyportEnergy</h1>
        <p className="skyport-energy-tagline">
          Home energy management and grid participation — HEMS, demand response, and VPP.
        </p>
        <figure className="skyport-energy-hero">
          <img
            src={`${import.meta.env.BASE_URL}images/skyport-energy-hero.png`}
            alt="Solar panels, wind turbines, and power lines — renewable energy and the grid"
            width={960}
            height={484}
            loading="eager"
            decoding="async"
          />
        </figure>
        <div className="skyport-energy-links-card">
          <h2 className="skyport-energy-links-card-title">Useful links</h2>
          <ul className="skyport-energy-doc-links" aria-label="Useful links">
            <li>
              <a
                className="skyport-energy-doc-link"
                href={officeViewUrl(VPP_PDF)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Virtual Power Plant (VPP): Utility - Leap - Daikin Flow
              </a>
            </li>
            <li>
              <a
                className="skyport-energy-doc-link"
                href={officeViewUrl(DAIKIN_VPP_PDF)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Virtual Power Plant (VPP): Utility - Leap - Daikin Process
              </a>
            </li>
          </ul>
        </div>
      </header>
    </article>
  )
}
