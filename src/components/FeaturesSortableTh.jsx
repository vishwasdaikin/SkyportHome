/**
 * Clickable table header for roadmap column sorting (SkyportHome, Features page).
 */
export function FeaturesSortableTh({ sortKey, sortConfig, onSort, children, className }) {
  const active = sortConfig.key === sortKey
  const dir = sortConfig.dir
  const ariaSort = active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'

  return (
    <th scope="col" className={className} aria-sort={ariaSort}>
      <button type="button" className="features-sort-header-btn" onClick={() => onSort(sortKey)}>
        <span className="features-sort-header-label">{children}</span>
        {active && (
          <span className="features-sort-indicator" aria-hidden>
            {dir === 'asc' ? ' ▲' : ' ▼'}
          </span>
        )}
      </button>
    </th>
  )
}
