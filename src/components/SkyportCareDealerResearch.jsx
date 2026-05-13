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

const DEALER_SUMMARY_PAGE_SIZE = 200
const INSIGHT_EXCLUDE_NO_COUNT = ['No Count']
const INSIGHT_EXCLUDE_BILLING_EXTRA = ['_col3']

function DealerResearchDefinitions() {
  const [open, setOpen] = useState(false)
  return (
    <details className="dealer-research-definitions-details" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="dealer-research-definitions-summary">{open ? 'Collapse' : 'Definitions'}</summary>
      <DealerResearchDefinitionsBody />
    </details>
  )
}

function DealerInsightsTable({ title, rows }) {
  if (!rows?.length) return null
  const keys = Object.keys(rows[0])
  return (
    <div className="dealer-research-chart-card">
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

function DealerInsightsServiceAndBillingCard({ serviceRows, billingRows }) {
  if (!serviceRows?.length && !billingRows?.length) return null
  return (
    <div className="dealer-research-chart-card">
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
      return dir * va.localeCompare(vb, undefined, { numeric: true, sensitivity: 'base' })
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
  const displayRows = useMemo(() => sortedSummary.slice(0, summaryVisibleCap), [sortedSummary, summaryVisibleCap])
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
          <p>
            <strong>Could not load dealer research.</strong>
          </p>
          <p>{error.message}</p>
          <p className="dealer-research-definitions-lead" style={{ marginTop: '0.75rem' }}>
            Ensure <code>public/generated-roadmaps/dealer-research.json</code> exists (run export when Dealer_Research.xlsx
            is available), then reload.
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

      <section className="dealer-research-summary">
        <h3 className="dealer-research-subheading">Dealer Summary</h3>
        <div className="dealer-research-search-row">
          <label>
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
            <div className="dealer-research-summary-pager">
              {summaryChunkCount > 1 ? (
                <button type="button" className="dealer-research-show-prev" onClick={() => setSummaryChunkCount((c) => Math.max(1, c - 1))}>
                  ← Show previous {summaryPrevRows.toLocaleString()}
                </button>
              ) : null}
              {summaryHasMore ? (
                <button type="button" className="dealer-research-show-next" onClick={() => setSummaryChunkCount((c) => c + 1)}>
                  Show next {Math.min(DEALER_SUMMARY_PAGE_SIZE, summaryRemaining).toLocaleString()} →
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
                    const active = sortConfig.key === k
                    return (
                      <th key={k} scope="col">
                        <button type="button" className="dealer-research-sort-btn" onClick={() => toggleSort(k)}>
                          {label}
                          {active ? (sortConfig.dir === 'asc' ? ' ▲' : ' ▼') : ''}
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
