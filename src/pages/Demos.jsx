import { Link } from 'react-router-dom'
import './Demos.css'

export default function Demos() {
  return (
    <article className="demos-page demos-page--embedded">
      <div className="demos-toolbar">
        <Link to="/apps/skyport-home" className="demos-back-link">
          ← SkyportHome
        </Link>
        <div className="demos-toolbar-links">
          <Link to="/demos/skyport-home-concept" className="demos-annotated-link">
            New concept demo
          </Link>
          <Link to="/demos/annotated" className="demos-back-link">
            Annotated overview
          </Link>
        </div>
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
