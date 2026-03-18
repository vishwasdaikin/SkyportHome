import { Link } from 'react-router-dom'
import './Demos.css'

export default function Demos() {
  return (
    <article className="demos-page demos-page--embedded">
      <div className="demos-toolbar">
        <Link to="/apps/skyport-home" className="demos-back-link">
          ← SkyportHome
        </Link>
      </div>
      <div className="demos-embed">
        <iframe
          src="/demos/Smart-Climate-Control-Dashboard.html"
          title="Smart Climate Control Dashboard"
          className="demos-iframe"
        />
      </div>
    </article>
  )
}
