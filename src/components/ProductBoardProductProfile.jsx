/** @param {string | undefined} iso */
function formatLastUpdatedDate(iso) {
  if (!iso || !String(iso).trim()) return null
  const s = String(iso).trim()
  const d = new Date(s.includes('T') ? s : `${s}T12:00:00`)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

/**
 * @param {{
 *   profile: import('../content/productBoardProducts').ProductBoardProfile
 *   hideMissionAndOwner?: boolean
 * }} props
 */
export default function ProductBoardProductProfile({ profile, hideMissionAndOwner = false }) {
  const mission = profile.mission?.trim()
  const owner = profile.pmOwner?.trim()
  const lastUpdatedRaw = profile.lastUpdated?.trim()
  const whatChanged = profile.whatChanged?.trim()
  const lastUpdatedDisplay = formatLastUpdatedDate(lastUpdatedRaw)
  const showMeta = Boolean(lastUpdatedDisplay || whatChanged)
  const ariaLabel = profile.productName?.trim() || 'Product profile'

  if (hideMissionAndOwner && !showMeta) return null

  return (
    <section className="product-board-profile" aria-label={ariaLabel}>
      {!hideMissionAndOwner ? (
        <div className="product-board-profile__summary">
          <p className="product-board-profile__line">
            <strong>Mission:</strong>{' '}
            {mission ? (
              mission
            ) : (
              <span className="product-board-profile__placeholder">Not set yet.</span>
            )}
          </p>
          <p className="product-board-profile__line">
            <strong>Owner:</strong>{' '}
            {owner ? owner : <span className="product-board-profile__placeholder">Not assigned</span>}
          </p>
        </div>
      ) : null}

      {showMeta ? (
        <div className="product-board-profile__meta">
          {lastUpdatedDisplay ? (
            <p className="product-board-profile__meta-line">
              <strong>Last updated:</strong>{' '}
              <time
                dateTime={/^\d{4}-\d{2}-\d{2}$/.test(lastUpdatedRaw) ? lastUpdatedRaw : undefined}
              >
                {lastUpdatedDisplay}
              </time>
            </p>
          ) : null}
          {whatChanged ? (
            <p className="product-board-profile__meta-line">
              <strong>What changed:</strong> <span className="product-board-profile__changelog">{whatChanged}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
