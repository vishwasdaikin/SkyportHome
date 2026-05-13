import { Link } from 'react-router-dom'
import { DIGITAL_TOOLS_ITEMS, productBoardPathForDigitalTool } from '../content/digitalToolsNav'
import { PRODUCT_BOARD_PRODUCTS } from '../content/productBoardProducts'
import './DigitalToolsPage.css'

function profileForTool(productId) {
  return PRODUCT_BOARD_PRODUCTS.find((p) => p.id === productId)?.profile
}

export default function DigitalToolsPage() {
  return (
    <div className="digital-tools-page">
      <header className="digital-tools-page__header">
        <h1 className="digital-tools-page__title">Digital Tools</h1>
      </header>

      <ul className="digital-tools-page__grid" role="list">
        {DIGITAL_TOOLS_ITEMS.map((tool) => {
          const profile = profileForTool(tool.productId)
          const mission = profile?.mission?.trim() || tool.summary
          const owner = profile?.pmOwner?.trim()

          return (
            <li key={tool.productId} className="digital-tools-page__tile-wrap">
              <div className="digital-tools-page__tile">
                <div className="digital-tools-page__tile-head">
                  <span className="digital-tools-page__tile-label">{tool.label}</span>
                  <Link
                    to={productBoardPathForDigitalTool(tool.productId)}
                    className="digital-tools-page__tile-cta"
                  >
                    See Details →
                  </Link>
                </div>
                <p className="digital-tools-page__tile-mission">
                  <span className="digital-tools-page__tile-kicker">Mission</span>
                  {mission ? mission : <span className="digital-tools-page__tile-placeholder">Not set yet.</span>}
                </p>
                <p className="digital-tools-page__tile-owner">
                  <span className="digital-tools-page__tile-kicker">Owner</span>
                  {owner ? owner : <span className="digital-tools-page__tile-placeholder">Not assigned</span>}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
