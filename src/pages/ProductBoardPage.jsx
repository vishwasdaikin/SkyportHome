import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductBoardProductProfile from '../components/ProductBoardProductProfile'
import ProductBoardUsageSection from '../components/ProductBoardUsageSection'
import {
  PRODUCT_BOARD_PRODUCTS,
  findWorkbookSheetForProduct,
} from '../content/productBoardProducts'
import { useDigitalFrameworkData } from '../hooks/useDigitalFrameworkData'
import { deriveColumnOrderFromObjects } from '../utils/workbookRowsToTable'
import {
  buildGroupsFromRows,
  filterProductBoardRows,
  findGroupColumnKey,
  isLikelyTemplateRow,
  slugifyForDomId,
  withDisplayGroup,
} from '../utils/productBoardRoadmapView'
import {
  canonicalFrameworkColumnOrder,
  filterProductBoardKpiColumns,
  getProductBoardCell,
  hasProductBoardSourceColumn,
  isBlankProductBoardDataRow,
  isProductBoardKpiColumn,
  normalizeProductBoardColumnHeader,
  sortProductBoardDisplayColumns,
} from '../utils/productBoardTableColumns'
import './SkyportHome.css'
import './ProductBoardPage.css'

function formatCell(value) {
  if (value == null) return '—'
  const s = String(value).replace(/\r\n/g, '\n').trim()
  return s === '' ? '—' : s
}

/** Stable slug for column-specific layout (matches CSS `product-board-table__col--*`). */
function productBoardColumnClass(col) {
  const slug = String(col ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug ? `product-board-table__col product-board-table__col--${slug}` : 'product-board-table__col'
}

/** Shorter / clearer labels in the table header (keys stay as in the workbook). */
function formatColumnHeaderLabel(col) {
  const n = normalizeProductBoardColumnHeader(col)
  if (n === 'input source' || n === 'source') return 'Source'
  return col
}

const DEFAULT_PRODUCT_BOARD_ID = PRODUCT_BOARD_PRODUCTS[0]?.id ?? 'techhub'

/** Product Board tabs that show the Roadmap table (search filters that table). */
const PRODUCT_BOARD_SHEET_OVERVIEW_IDS = new Set(['techhub', 'hvac-learning-campus', 'daikin-city'])

/**
 * Left sheet columns, then Theme / Why / KPIs / Source / Timeframe when present,
 * then the sheet’s trailing five columns (deduped by column key).
 */
function buildOverviewSheetColumns(columns) {
  if (!Array.isArray(columns) || columns.length === 0) return []
  const left = columns.slice(0, 3)
  const seenNorm = new Set(left.map((c) => normalizeProductBoardColumnHeader(c)))
  const out = [...left]

  const appendByNormalizedName = (norm) => {
    const found = columns.find((c) => normalizeProductBoardColumnHeader(c) === norm)
    if (!found) return
    const n = normalizeProductBoardColumnHeader(found)
    if (seenNorm.has(n)) return
    out.push(found)
    seenNorm.add(n)
  }

  appendByNormalizedName('theme')
  appendByNormalizedName('why / expected outcome')

  const kpiCol =
    columns.find(
      (c) => normalizeProductBoardColumnHeader(c) === 'kpis' && !seenNorm.has('kpis'),
    ) ??
    columns.find((c) => {
      const n = normalizeProductBoardColumnHeader(c)
      return isProductBoardKpiColumn(c) && !seenNorm.has(n)
    })
  if (kpiCol) {
    out.push(kpiCol)
    seenNorm.add(normalizeProductBoardColumnHeader(kpiCol))
  }

  appendByNormalizedName('source')

  const timeframeCol = columns.find((c) => {
    const n = normalizeProductBoardColumnHeader(c)
    if (seenNorm.has(n)) return false
    return n === 'timeframe' || n === 'time frame' || n === 'focus timeframe'
  })
  if (timeframeCol) {
    out.push(timeframeCol)
    seenNorm.add(normalizeProductBoardColumnHeader(timeframeCol))
  }

  const seenKeys = new Set(out)
  for (const c of columns.slice(-5)) {
    if (seenKeys.has(c)) continue
    out.push(c)
    seenKeys.add(c)
  }

  return out
}

export default function ProductBoardPage() {
  const { sheetNames, sheets, workbook, loading, error } = useDigitalFrameworkData({
    pollMs: 4000,
  })
  const [searchParams] = useSearchParams()

  const productId = useMemo(() => {
    const q = searchParams.get('product')
    if (q && PRODUCT_BOARD_PRODUCTS.some((p) => p.id === q)) return q
    return DEFAULT_PRODUCT_BOARD_ID
  }, [searchParams])

  const [search, setSearch] = useState('')
  /** Default to full table so all rows (e.g. last columns) are visible without expanding accordions. */
  const [viewMode, setViewMode] = useState('table')
  const [openGroups, setOpenGroups] = useState(() => new Set())

  const activeProduct = useMemo(
    () => PRODUCT_BOARD_PRODUCTS.find((p) => p.id === productId) ?? PRODUCT_BOARD_PRODUCTS[0],
    [productId],
  )

  const resolvedSheetName = useMemo(
    () => findWorkbookSheetForProduct(sheetNames, activeProduct),
    [sheetNames, activeProduct],
  )

  const rawRows = useMemo(() => {
    if (!resolvedSheetName || !sheets[resolvedSheetName]) return []
    const r = sheets[resolvedSheetName]
    return Array.isArray(r) ? r : []
  }, [resolvedSheetName, sheets])

  const columns = useMemo(
    () => canonicalFrameworkColumnOrder(deriveColumnOrderFromObjects(rawRows)),
    [rawRows],
  )
  const roadmapColumns = useMemo(() => {
    return sortProductBoardDisplayColumns(filterProductBoardKpiColumns(columns))
  }, [columns])

  /** Roadmap table columns: curated set (Detail and Why / Expected Outcome as columns). */
  const overviewColumns = useMemo(() => buildOverviewSheetColumns(columns), [columns])

  const sheetHasSourceColumn = useMemo(() => hasProductBoardSourceColumn(columns), [columns])
  const groupColumnKey = useMemo(() => findGroupColumnKey(columns), [columns])
  const hasGroupColumn = Boolean(groupColumnKey)

  /** By group: omit the group column in nested tables (accordion title is the group). */
  const overviewColumnsGroupedTable = useMemo(() => {
    if (!groupColumnKey) return overviewColumns
    const without = overviewColumns.filter((c) => c !== groupColumnKey)
    return without.length > 0 ? without : overviewColumns
  }, [overviewColumns, groupColumnKey])

  useEffect(() => {
    setSearch('')
    setOpenGroups(new Set())
    setViewMode('table')
  }, [resolvedSheetName, groupColumnKey])

  const dataRows = useMemo(
    () =>
      rawRows.filter(
        (row) => row && typeof row === 'object' && !Array.isArray(row) && !isBlankProductBoardDataRow(row, columns),
      ),
    [rawRows, columns],
  )

  const dataRowsNoTemplate = useMemo(
    () => dataRows.filter((row) => !isLikelyTemplateRow(row, columns)),
    [dataRows, columns],
  )

  const rowsWithDisplayGroup = useMemo(
    () => withDisplayGroup(dataRowsNoTemplate, groupColumnKey),
    [dataRowsNoTemplate, groupColumnKey],
  )

  const filteredRows = useMemo(
    () => filterProductBoardRows(rowsWithDisplayGroup, columns, search),
    [rowsWithDisplayGroup, columns, search],
  )

  const groups = useMemo(() => buildGroupsFromRows(filteredRows), [filteredRows])

  const sheetMissing = Boolean(workbook && !error && resolvedSheetName == null)

  const roadmapFeatureNames = useMemo(() => {
    const col = columns.find((c) => c === 'Feature / Function' || c === 'Feature')
    if (!col || dataRowsNoTemplate.length === 0) return []
    const seen = new Set()
    const out = []
    for (const row of dataRowsNoTemplate) {
      const t = String(getProductBoardCell(row, col) || '').trim()
      if (!t || seen.has(t)) continue
      seen.add(t)
      out.push(t)
      if (out.length >= 24) break
    }
    return out
  }, [dataRowsNoTemplate, columns])

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupName)) next.delete(groupName)
      else next.add(groupName)
      return next
    })
  }

  const expandAll = () => setOpenGroups(new Set(groups.map((g) => g.groupName)))
  const collapseAll = () => setOpenGroups(new Set())

  const renderTableHead = (cols) => (
    <thead>
      <tr>
        {cols.map((col) => (
          <th key={col} scope="col" className={productBoardColumnClass(col)}>
            {formatColumnHeaderLabel(col)}
          </th>
        ))}
      </tr>
    </thead>
  )

  const renderTableBody = (rows, cols, rowKeyPrefix) => (
    <tbody>
      {rows.map((row, ri) => (
        <tr key={rowKeyPrefix != null ? `${rowKeyPrefix}-${ri}` : ri}>
          {cols.map((col) => (
            <td key={col} className={productBoardColumnClass(col)}>
              {formatCell(getProductBoardCell(row, col))}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )

  return (
    <div className="product-board-page">
      <h1 className="product-board-page__sr-only">Digital Tools</h1>
      {error ? (
        <header className="product-board-page__header">
          <p className="product-board-page__error" role="alert">
            {error.message}
          </p>
        </header>
      ) : null}

      <ProductBoardProductProfile profile={activeProduct.profile} hideMissionAndOwner />

      {loading && !workbook ? <p className="product-board-page__meta">Loading workbook…</p> : null}

      {!loading && sheetNames.length === 0 && !error ? (
        <p className="product-board-page__meta" role="status">
          No sheets loaded. Refresh the page, or run <code className="product-board-page__code">npm run export-roadmaps</code>{' '}
          to refresh the exported workbook.
        </p>
      ) : null}

      {sheetMissing ? (
        <div className="product-board-page__empty" role="status">
          <p className="product-board-page__empty-title">No data for {activeProduct.label}</p>
          <p className="product-board-page__empty-text">
            This product expects a tab named <strong>{activeProduct.sheetName}</strong>
            {Array.isArray(activeProduct.sheetAliases) && activeProduct.sheetAliases.length > 0 ? (
              <>
                {' '}
                (or <strong>{activeProduct.sheetAliases.join(', ')}</strong>)
              </>
            ) : null}{' '}
            in <strong>Digital_Framework.xlsx</strong>.{' '}
            {sheetNames.length > 0 ? (
              <>
                Workbook tabs detected: <strong>{sheetNames.join(', ')}</strong>.
              </>
            ) : (
              <>
                No tabs were returned from the workbook JSON. Run{' '}
                <code className="product-board-page__code">npm run export-roadmaps</code> or refresh the page.
              </>
            )}
          </p>
        </div>
      ) : null}

      {!sheetMissing && resolvedSheetName && columns.length === 0 ? (
        <div className="product-board-page__empty" role="status">
          <p className="product-board-page__empty-title">{activeProduct.label}</p>
          <p className="product-board-page__empty-text">This sheet has no data rows yet.</p>
        </div>
      ) : null}

      {!sheetMissing && resolvedSheetName && columns.length > 0 && roadmapColumns.length === 0 ? (
        <div className="product-board-page__empty" role="status">
          <p className="product-board-page__empty-title">{activeProduct.label}</p>
          <p className="product-board-page__empty-text">
            This sheet has no roadmap columns to show after excluding KPI columns.
          </p>
        </div>
      ) : null}

      {!sheetMissing && roadmapColumns.length > 0 ? (
        <>
          {PRODUCT_BOARD_SHEET_OVERVIEW_IDS.has(activeProduct.id) && overviewColumns.length > 0 ? (
            <section
              className="product-board-page__sheet-overview"
              aria-label={`${activeProduct.label} — Roadmap (Digital Framework)`}
            >
              <header className="product-board-page__current-tool-head">
                <h2 className="product-board-page__current-tool-title" id="product-board-current-tool-heading">
                  {activeProduct.profile?.productName?.trim() || activeProduct.label}
                </h2>
              </header>
              <div className="features-toolbar product-board-page__roadmap-toolbar product-board-page__roadmap-toolbar--in-overview">
                <div className="features-search-wrap">
                  <label htmlFor="product-board-roadmap-search" className="features-search-label">
                    Search
                  </label>
                  <input
                    id="product-board-roadmap-search"
                    type="search"
                    placeholder="Search by feature, group, category…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="features-search-input"
                    aria-label="Search roadmap rows"
                  />
                </div>
                {hasGroupColumn ? (
                  <div className="features-view-toggle" role="group" aria-label="View mode">
                    <button
                      type="button"
                      className={`features-view-btn ${viewMode === 'grouped' ? 'active' : ''}`}
                      onClick={() => setViewMode('grouped')}
                    >
                      By group
                    </button>
                    <button
                      type="button"
                      className={`features-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                    >
                      Full table
                    </button>
                  </div>
                ) : null}
                {hasGroupColumn && viewMode === 'grouped' ? (
                  <div className="features-accordion-actions">
                    <button type="button" className="features-expand-btn" onClick={expandAll}>
                      Expand all
                    </button>
                    <button type="button" className="features-expand-btn" onClick={collapseAll}>
                      Collapse all
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="product-board-page__sheet-overview-heading">
                <h3 className="product-board-page__sheet-overview-title" id="product-board-roadmap-strip-heading">
                  Roadmap
                </h3>
              </div>
              <div id="product-board-roadmap-strip-table">
                {hasGroupColumn && viewMode === 'grouped' ? (
                  <div className="features-grouped">
                    <div className="features-accordion">
                      {groups.map(({ groupName, rows: groupRows }, gi) => {
                        const slug = `${slugifyForDomId(groupName)}-${gi}`
                        return (
                          <div key={`${groupName}-${gi}`} className="features-accordion-item">
                            <button
                              type="button"
                              className="features-accordion-trigger"
                              onClick={() => toggleGroup(groupName)}
                              aria-expanded={openGroups.has(groupName)}
                              aria-controls={`product-board-panel-${slug}`}
                              id={`product-board-trigger-${slug}`}
                            >
                              <span className="features-accordion-title">{groupName}</span>
                              <span className="features-accordion-count">{groupRows.length}</span>
                              <span className="features-accordion-icon" aria-hidden>
                                {openGroups.has(groupName) ? '−' : '+'}
                              </span>
                            </button>
                            <div
                              id={`product-board-panel-${slug}`}
                              className="features-accordion-panel"
                              role="region"
                              aria-labelledby={`product-board-trigger-${slug}`}
                              hidden={!openGroups.has(groupName)}
                            >
                              <div className="features-panel-table-wrap product-board-page__panel-table-wrap">
                                <div
                                  className="product-board-table-wrap product-board-table-wrap--nested product-board-page__sheet-overview-table-wrap"
                                  tabIndex={0}
                                >
                                  <table
                                    className="product-board-table product-board-table--sheet-overview product-board-table--nested"
                                    data-product-board-cols={overviewColumnsGroupedTable.join('|')}
                                  >
                                    {renderTableHead(overviewColumnsGroupedTable)}
                                    {renderTableBody(groupRows, overviewColumnsGroupedTable, slug)}
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div
                    className="features-table-wrap product-board-page__full-table-wrap product-board-page__roadmap-single-table"
                    tabIndex={0}
                  >
                    <div className="product-board-table-wrap product-board-page__sheet-overview-table-wrap">
                      <table
                        className="product-board-table product-board-table--sheet-overview"
                        data-product-board-cols={overviewColumns.join('|')}
                      >
                        {renderTableHead(overviewColumns)}
                        {renderTableBody(filteredRows, overviewColumns)}
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {!sheetHasSourceColumn && roadmapColumns.length > 0 ? (
            <p className="product-board-page__meta" role="note">
              The loaded JSON has no <strong>Source</strong> or <strong>Input Source</strong> column key for this tab.
              In Excel, put the text <strong>Source</strong> (or <strong>Input Source</strong>) in <strong>row 1</strong> of that column—avoid merged cells for the header cell itself—save the workbook, then refresh.
              If you use static JSON, run <code className="product-board-page__code">npm run export-roadmaps</code>.
            </p>
          ) : null}
        </>
      ) : null}

      <ProductBoardUsageSection
        productLabel={activeProduct.profile.productName || activeProduct.label}
        roadmapFeatures={roadmapFeatureNames}
      />
    </div>
  )
}
