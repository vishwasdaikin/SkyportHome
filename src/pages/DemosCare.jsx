import { Link } from 'react-router-dom'
import { AppCare } from '../demos/care/AppCare'
import './Demos.css'

export default function DemosCare() {
  return (
    <article className="demos-page demos-page--embedded">
      <div className="demos-toolbar">
        <Link to="/apps/skyport-care" className="demos-back-link">
          ← SkyportCare
        </Link>
      </div>
      <div className="demos-embed demos-embed--care">
        <AppCare />
      </div>
    </article>
  )
}
