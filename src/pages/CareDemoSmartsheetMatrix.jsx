import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../lib/api.js'
import './CareDemoSmartsheetMatrix.css'

/** Best-effort text for a Smartsheet cell (GET sheet). */
function cellDisplayText(cell) {
  if (cell == null || typeof cell !== 'object') return ''
  if (typeof cell.displayValue === 'string' && cell.displayValue !== '') return cell.displayValue
  const v = cell.value
  if (v == null || v === '') return ''
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return v
  if (Array.isArray(v)) {
    return v
      .map((item) => {
        if (item != null && typeof item === 'object' && typeof item.displayValue === 'string') {
          return item.displayValue
        }
        if (item != null && typeof item === 'object' && typeof item.name === 'string') {
          return item.name
        }
        return String(item)
      })
      .filter(Boolean)
      .join(', ')
  }
  if (typeof v === 'object') {
    if (typeof v.name === 'string') return v.name
    if (Array.isArray(v.values)) {
      return v.values.map((x) => (x != null && typeof x === 'object' ? x.displayValue ?? x.name : x)).join(', ')
    }
  }
  return ''
}

function CellContent({ text }) {
  const raw = text == null ? '' : String(text)
  const t = raw.trim()
  if (/^https?:\/\//i.test(t)) {
    return (
      <a href={t} target="_blank" rel="noopener noreferrer" className="care-demo-ss-link">
        {t.length > 48 ? `${t.slice(0, 45)}…` : t}
      </a>
    )
  }
  return <span className="care-demo-ss-cell-text">{raw}</span>
}

export default function CareDemoSmartsheetMatrix() {
  const [sheet, setSheet] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(apiUrl('/smartsheet/sheet'))
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) {
          setSheet(null)
          setError(typeof data.message === 'string' ? data.message : res.statusText || 'Request failed')
          return
        }
        setSheet(data)
      } catch (e) {
        if (!cancelled) {
          setSheet(null)
          setError(e instanceof Error ? e.message : 'Network error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const { columns, rows, cellsByRow } = useMemo(() => {
    if (!sheet || typeof sheet !== 'object') {
      return { columns: [], rows: [], cellsByRow: new Map() }
    }
    const cols = Array.isArray(sheet.columns) ? sheet.columns : []
    const rws = Array.isArray(sheet.rows) ? sheet.rows : []
    const map = new Map()
    for (const row of rws) {
      const byCol = new Map()
      const cells = Array.isArray(row.cells) ? row.cells : []
      for (const c of cells) {
        if (c && c.columnId != null) byCol.set(c.columnId, c)
      }
      map.set(row.id, byCol)
    }
    return { columns: cols, rows: rws, cellsByRow: map }
  }, [sheet])

  const sheetTitle = sheet && typeof sheet.name === 'string' ? sheet.name : 'Sheet'

  return (
    <div className="care-demo-ss-root" aria-busy={loading}>
      <header className="care-demo-ss-toolbar">
        <div className="care-demo-ss-toolbar-menus" aria-hidden="true">
          <span className="care-demo-ss-menu-item">File</span>
          <span className="care-demo-ss-menu-item">Automation</span>
          <span className="care-demo-ss-menu-item">Forms</span>
        </div>
        <div className="care-demo-ss-toolbar-title-row">
          <h1 className="care-demo-ss-sheet-title">{sheetTitle}</h1>
          <span className="care-demo-ss-badge">Live (read-only)</span>
        </div>
      </header>

      <div className="care-demo-ss-format-bar" aria-hidden="true">
        <span className="care-demo-ss-format-placeholder">Arial</span>
        <span className="care-demo-ss-format-placeholder">10</span>
        <span className="care-demo-ss-format-div" />
        <span className="care-demo-ss-format-placeholder care-demo-ss-format-faint">B</span>
        <span className="care-demo-ss-format-placeholder care-demo-ss-format-faint">I</span>
        <span className="care-demo-ss-format-placeholder care-demo-ss-format-faint">U</span>
      </div>

      <div className="care-demo-ss-scroll">
        {loading ? (
          <p className="care-demo-ss-message">Loading sheet…</p>
        ) : error ? (
          <p className="care-demo-ss-message care-demo-ss-message--error" role="alert">
            {error}
          </p>
        ) : columns.length === 0 ? (
          <p className="care-demo-ss-message">No columns in this sheet.</p>
        ) : (
          <table className="care-demo-ss-table">
            <thead>
              <tr>
                <th className="care-demo-ss-th care-demo-ss-th--rownum">#</th>
                {columns.map((col) => (
                  <th
                    key={String(col.id)}
                    className={`care-demo-ss-th${col.primary ? ' care-demo-ss-th--primary' : ''}`}
                    scope="col"
                    title={col.title != null ? String(col.title) : ''}
                  >
                    {col.title != null ? String(col.title) : '—'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const byCol = cellsByRow.get(row.id) ?? new Map()
                const rowNum = row.rowNumber != null ? String(row.rowNumber) : String(idx + 1)
                return (
                  <tr key={String(row.id)} className="care-demo-ss-tr">
                    <td className="care-demo-ss-td care-demo-ss-td--rownum">{rowNum}</td>
                    {columns.map((col) => {
                      const cell = byCol.get(col.id)
                      const text = cellDisplayText(cell)
                      return (
                        <td
                          key={`${row.id}-${col.id}`}
                          className={`care-demo-ss-td${col.primary ? ' care-demo-ss-td--primary' : ''}`}
                        >
                          <CellContent text={text} />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
