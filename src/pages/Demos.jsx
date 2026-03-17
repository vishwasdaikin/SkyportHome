import { Link } from 'react-router-dom'
import './Demos.css'

export default function Demos() {
  return (
    <article className="demos-page demos-page--embedded">
      <div className="demos-embed">
        <div className="demos-view-options">
          <Link to="/demos/annotated" className="demos-annotated-link">
            View with callouts
          </Link>
        </div>
        <iframe
          src="/demos/Smart-Climate-Control-Dashboard.html"
          title="Smart Climate Control Dashboard"
          className="demos-iframe"
        />
      </div>
    </article>
  )
}
