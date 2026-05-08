import { useEffect, useMemo, useState } from 'react'
import { useDealerResearchData } from '../hooks/useDealerResearchData'
import {
  extractTableAfterSection,
  filterInsightTableColumns,
  formatDealerInsightsCell,
  parseDealerInsightsMeta,
  resolveDealerInsightsSheetName,
  resolveDealerSummarySheetName,
} from '../utils/dealerResearchInsights'
import {
  dealerSummaryKeysFromRows,
  dealerSummaryColumnHeaderLabel,
} from '../utils/dealerResearchSummaryColumns'
import { DealerResearchDefinitionsBody } from '../content/dealerResearchDefinitions'
import './SkyportCareDealerResearch.css'

function DealerResearchDefinitions() {
  const [definitionsOpen, setDefinitionsOpen] = useState(false)
  return (
    <details
      className="dealer-research-definitions-details"
      onToggle={(e) => setDefinitionsOpen(e.currentTarget.open)}
    >
      <summary className="dealer-research-definitions-summary">
        {definitionsOpen ? 'Collapse' : 'Definitions'}
      </summary>
      <DealerResearchDefinitionsBody />
    </details>
  )
}

/** Chunk size for Dealer Summary table — avoids rendering tens of thousands of DOM rows at once. */
const DEALER_SUMMARY_PAGE_SIZE = 200

/** Insights UI: hide redundant / Excel-placeholder columns */
const INSIGHT_EXCLUDE_NO_COUNT = ['No Count']
const INSIGHT_EXCLUDE_BILLING_EXTRA = ['_col3']

function DealerInsightsTable({ title, rows }) {
  if (!rows?.length) return null
  const keys = Object.keys(rows[0])
  return (
    <div className="dealer-research-chart-card dealer-research-insights-card">
      <h3 className="dealer-research-chart-title">{title}</h3>
      <div className="dealer-research-insights-table-wrap">
        <table className="dealer-research-insights-table">
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k} scope="col">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {keys.map((k) => (
                  <td key={k}>{formatDealerInsightsCell(k, row[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DealerInsightsSubTable({ heading, rows }) {
  if (!rows?.length) return null
  const keys = Object.keys(rows[0])
  return (
    <div className="dealer-research-insights-subsection">
      <h4 className="dealer-research-insights-subheading">{heading}</h4>
      <div className="dealer-research-insights-table-wrap">
        <table className="dealer-research-insights-table">
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k} scope="col">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {keys.map((k) => (
                  <td key={k}>{formatDealerInsightsCell(k, row[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** One card: Service offerings and Billing cadence, each with its own column header row. */
function DealerInsightsServiceAndBillingCard({ serviceRows, billingRows }) {
  if (!serviceRows?.length && !billingRows?.length) return null
  return (
    <div className="dealer-research-chart-card dealer-research-insights-card">
      <h3 className="dealer-research-chart-title">Service offerings & billing cadence</h3>
      <DealerInsightsSubTable heading="Service offerings" rows={serviceRows} />
      <DealerInsightsSubTable heading="Billing cadence" rows={billingRows} />
    </div>
  )
}

export default function SkyportCareDealerResearch() {
  const { sheetNames, sheets, grids, loading, error, refetch } = useDealerResearchData()
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' })
  const [summaryChunkCount, setSummaryChunkCount] = useState(1)

  const summaryName = useMemo(() => resolveDealerSummarySheetName(sheetNames), [sheetNames])
  const insightsName = useMemo(() => resolveDealerInsightsSheetName(sheetNames), [sheetNames])

  const insightsGrid = insightsName ? grids[insightsName] : null

  const insightsMeta = useMemo(() => {
    if (!insightsGrid?.length) return null
    return parseDealerInsightsMeta(insightsGrid)
  }, [insightsGrid])

  const insightTables = useMemo(() => {
    if (!insightsGrid?.length) return null
    return {
      programs: filterInsightTableColumns(
        extractTableAfterSection(insightsGrid, 'PROGRAM PARTICIPATION'),
        INSIGHT_EXCLUDE_NO_COUNT,
      ),
      services: filterInsightTableColumns(
        extractTableAfterSection(insightsGrid, 'SERVICE OFFERINGS'),
        INSIGHT_EXCLUDE_NO_COUNT,
      ),
      electrification: filterInsightTableColumns(
        extractTableAfterSection(insightsGrid, 'ELECTRIFICATION CAPABILITIES'),
        INSIGHT_EXCLUDE_NO_COUNT,
      ),
      billing: filterInsightTableColumns(
        extractTableAfterSection(insightsGrid, 'BILLING CADENCE BREAKDOWN'),
        INSIGHT_EXCLUDE_BILLING_EXTRA,
      ),
    }
  }, [insightsGrid])

  const summaryRows = summaryName ? sheets[summaryName] : []
  const columnKeys = useMemo(() => dealerSummaryKeysFromRows(summaryRows), [summaryRows])

  const rowsAfterSearch = useMemo(() => {
    if (!summaryRows?.length) return []
    const q = search.trim().toLowerCase()
    if (!q) return summaryRows
    return summaryRows.filter((row) => {
      const blob = columnKeys.map((k) => String(row[k] ?? '').toLowerCase()).join(' ')
      return blob.includes(q)
    })
  }, [summaryRows, search, columnKeys])

  const sortedSummary = useMemo(() => {
    const key = sortConfig.key
    if (!key || !rowsAfterSearch.length) return rowsAfterSearch
    const dir = sortConfig.dir === 'desc' ? -1 : 1
    return [...rowsAfterSearch].sort((a, b) => {
      const va = String(a[key] ?? '').trim()
      const vb = String(b[key] ?? '').trim()
      const cmp = va.localeCompare(vb, undefined, { numeric: true, sensitivity: 'base' })
      return dir * cmp
    })
  }, [rowsAfterSearch, sortConfig])

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  useEffect(() => {
    setSummaryChunkCount(1)
  }, [search])

  const summaryVisibleCap = summaryChunkCount * DEALER_SUMMARY_PAGE_SIZE
  const displayRows = useMemo(
    () => sortedSummary.slice(0, summaryVisibleCap),
    [sortedSummary, summaryVisibleCap],
  )
  const summaryHasMore = sortedSummary.length > displayRows.length
  const summaryRemaining = Math.max(0, sortedSummary.length - displayRows.length)
  const summaryPrevRows =
    summaryChunkCount > 1
      ? Math.min(
          DEALER_SUMMARY_PAGE_SIZE,
          displayRows.length - (summaryChunkCount - 1) * DEALER_SUMMARY_PAGE_SIZE,
        )
      : 0
  const showSummaryPager = summaryChunkCount > 1 || summaryHasMore

  if (loading) {
    return (
      <div className="dealer-research-loading">
        <p>Loading dealer research…</p>
      </div>
    )
  }

  if (error) {
    return (
      <>
        <DealerResearchDefinitions />
        <div className="dealer-research-error" role="alert">
        <p className="dealer-research-error-title">Could not load Dealer_Research.xlsx</p>
        <p className="dealer-research-error-detail">{error.message}</p>
        <p className="dealer-research-error-hint">
          Add <code>Dealer_Research.xlsx</code> to your OneDrive <code>Skyport-Web-Shared-Test</code> folder (or set{' '}
          <code>LOCAL_DEALER_RESEARCH_XLSX_FILE</code>), run <code>npm run dev</code>, then retry.
        </p>
        <button type="button" className="dealer-research-retry" onClick={() => refetch()}>
          Retry
        </button>
        </div>
      </>
    )
  }

  return (
    <div className="dealer-research-root">
      <section className="dealer-research-charts">
        <DealerResearchDefinitions />
        {insightsMeta?.totalDealers != null ? (
          <p className="dealer-research-insights-meta">
            <span className="dealer-research-insights-meta-label">Total dealers analyzed:</span>{' '}
            {insightsMeta.totalDealers.toLocaleString()}
          </p>
        ) : null}
        <div className="dealer-research-chart-grid">
          <DealerInsightsServiceAndBillingCard
            serviceRows={insightTables?.services}
            billingRows={insightTables?.billing}
          />
          <DealerInsightsTable title="Electrification capabilities" rows={insightTables?.electrification} />
          <DealerInsightsTable title="Program participation" rows={insightTables?.programs} />
        </div>
      </section>

      <section className="dealer-research-summary" aria-labelledby="dealer-research-summary-heading">
        <h3 id="dealer-research-summary-heading" className="dealer-research-subheading">
          Dealer Summary
        </h3>
        <div className="dealer-research-search-row">
          <label className="dealer-research-search-label">
            <span className="sr-only">Search dealers</span>
            <input
              type="search"
              className="dealer-research-search-input"
              placeholder="Search across all columns…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <p className="dealer-research-summary-count">
          Showing <strong>{displayRows.length}</strong> of <strong>{sortedSummary.length}</strong> matching (
          <strong>{summaryRows.length}</strong> total in sheet)
        </p>
        <div className="dealer-research-summary-table-shell">
          {showSummaryPager ? (
            <div className="dealer-research-summary-pager dealer-research-summary-pager--above-table">
              {summaryChunkCount > 1 ? (
                <button
                  type="button"
                  className="dealer-research-show-prev"
                  onClick={() => setSummaryChunkCount((c) => Math.max(1, c - 1))}
                >
                  <span className="dealer-research-show-prev-arrow" aria-hidden>
                    ←
                  </span>
                  <span className="dealer-research-show-prev-label">
                    Show previous {summaryPrevRows.toLocaleString()}
                  </span>
                </button>
              ) : null}
              {summaryHasMore ? (
                <button
                  type="button"
                  className="dealer-research-show-next"
                  onClick={() => setSummaryChunkCount((c) => c + 1)}
                >
                  <span className="dealer-research-show-next-label">
                    Show next {Math.min(DEALER_SUMMARY_PAGE_SIZE, summaryRemaining).toLocaleString()}
                    {summaryRemaining > DEALER_SUMMARY_PAGE_SIZE
                      ? ` (${summaryRemaining.toLocaleString()} remaining)`
                      : ''}
                  </span>
                  <span className="dealer-research-show-next-arrow" aria-hidden>
                    →
                  </span>
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="dealer-research-table-scroll">
            <table className="dealer-research-table">
              <thead>
                <tr>
                  {columnKeys.map((k) => {
                    const label = dealerSummaryColumnHeaderLabel(k)
                    const activeSort = sortConfig.key === k
                    const ariaSort = activeSort
                      ? sortConfig.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                    return (
                      <th key={k} scope="col" className="dealer-research-th-cell" aria-sort={ariaSort}>
                        <button
                          type="button"
                          className="dealer-research-sort-btn dealer-research-sort-btn--header-only"
                          onClick={() => toggleSort(k)}
                          title={`Sort by ${label}`}
                        >
                          <span className="dealer-research-sort-btn-label">{label}</span>
                          {activeSort ? (
                            <span className="dealer-research-sort-indicator" aria-hidden>
                              {sortConfig.dir === 'asc' ? ' ▲' : ' ▼'}
                            </span>
                          ) : null}
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, ri) => (
                  <tr key={ri}>
                    {columnKeys.map((k) => (
                      <td key={k}>{String(row[k] ?? '').trim() || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
