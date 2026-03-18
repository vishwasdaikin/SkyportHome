import { Link } from 'react-router-dom'
import './AppsPage.css'

const base = import.meta.env.BASE_URL || '/'

const APP_TILES = [
  {
    to: '/apps/skyport-home',
    title: 'SkyportHome',
    description:
      'Always-on homeowner engagement — product capabilities, roadmap, and the homeowner experience across the full lifecycle.',
    image: `${base}images/skyport-home-hero.png`,
    imageAlt: 'Homeowner using the Daikin thermostat app',
  },
  {
    to: '/apps/skyport-care',
    title: 'SkyportCare',
    description:
      'Dealer execution at scale — the dealer operating layer for installs, service, and connected care across the lifecycle.',
    image: `${base}images/skyport-care-hero.png`,
    imageAlt: 'Daikin service technician with service van',
  },
  {
    to: '/apps/skyport-energy',
    title: 'SkyportEnergy',
    description:
      'Home energy management and grid participation — HEMS, demand response, and virtual power plant (VPP) programs.',
    image: `${base}images/skyport-energy-hero.png`,
    imageAlt: 'Solar, wind, and grid — renewable energy',
  },
]

export default function AppsPage() {
  return (
    <article className="apps-page apps-page--suite">
      <header className="apps-page-header">
        <h1>App Suite</h1>
        <p className="apps-page-intro">
          Skyport products — choose an app for roadmap, capabilities, and reference materials.
        </p>
      </header>

      <ul className="apps-tiles" aria-label="Skyport applications">
        {APP_TILES.map((app) => (
          <li key={app.to} className="apps-tile-wrap">
            <Link to={app.to} className="apps-tile">
              <div className="apps-tile-image-wrap">
                <img src={app.image} alt={app.imageAlt} className="apps-tile-image" loading="lazy" />
              </div>
              <div className="apps-tile-body">
                <h2 className="apps-tile-title">{app.title}</h2>
                <p className="apps-tile-desc">{app.description}</p>
                <span className="apps-tile-cta">Open →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
