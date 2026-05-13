import { describe, expect, it } from 'vitest'
import {
  canonicalFrameworkColumnOrder,
  filterProductBoardKpiColumns,
  getProductBoardCell,
  hasProductBoardSourceColumn,
  isBlankProductBoardDataRow,
  isProductBoardKpiColumn,
  normalizeProductBoardColumnHeader,
  sortProductBoardDisplayColumns,
} from './productBoardTableColumns'

describe('normalizeProductBoardColumnHeader', () => {
  it('NFKC + trims and lowercases', () => {
    expect(normalizeProductBoardColumnHeader('  KPIs \u00a0')).toBe('kpis')
  })

  it('strips BOM / ZWSP', () => {
    expect(normalizeProductBoardColumnHeader('\uFEFFKPIs')).toBe('kpis')
  })
})

describe('isProductBoardKpiColumn', () => {
  it('treats KPIs / KPI as KPI', () => {
    expect(isProductBoardKpiColumn('KPIs')).toBe(true)
    expect(isProductBoardKpiColumn('KPI')).toBe(true)
    expect(isProductBoardKpiColumn('Roadmap KPIs')).toBe(true)
    expect(isProductBoardKpiColumn('key performance indicators')).toBe(true)
  })

  it('never treats source columns as KPI', () => {
    expect(isProductBoardKpiColumn('Input Source')).toBe(false)
    expect(isProductBoardKpiColumn('Source')).toBe(false)
    expect(isProductBoardKpiColumn('Data Source')).toBe(false)
  })
})

describe('filterProductBoardKpiColumns', () => {
  it('removes KPI-style headers', () => {
    const cols = ['Feature Group', 'KPIs', 'Theme', 'Input Source']
    expect(filterProductBoardKpiColumns(cols)).toEqual(['Feature Group', 'Theme', 'Input Source'])
  })
})

describe('hasProductBoardSourceColumn', () => {
  it('detects Input Source / Source', () => {
    expect(hasProductBoardSourceColumn(['Theme', 'Input Source'])).toBe(true)
    expect(hasProductBoardSourceColumn(['Theme', 'Why'])).toBe(false)
  })
})

describe('canonicalFrameworkColumnOrder', () => {
  it('merges Input Source and spaced Source into one Source column', () => {
    expect(
      canonicalFrameworkColumnOrder(['Feature Group', ' Input Source', ' Theme', ' Source', 'Status']),
    ).toEqual(['Feature Group', 'Source', ' Theme', 'Status'])
  })
})

describe('getProductBoardCell', () => {
  it('reads Source when row only has a spaced header key', () => {
    const row = { ' Source': 'Internal', Theme: 'T' }
    expect(getProductBoardCell(row, 'Source')).toBe('Internal')
    expect(getProductBoardCell(row, 'Input Source')).toBe('Internal')
  })

  it('matches column key by normalized header', () => {
    const row = { 'Feature / Function': 'X' }
    expect(getProductBoardCell(row, 'Feature / Function')).toBe('X')
  })
})

describe('isBlankProductBoardDataRow', () => {
  it('does not treat row as blank when only Source-like key has data', () => {
    const row = { ' Source': 'A', KPIs: '' }
    expect(isBlankProductBoardDataRow(row, ['Source', 'KPIs'])).toBe(false)
  })
})

describe('sortProductBoardDisplayColumns', () => {
  it('places Status Details after Status and before Dependency', () => {
    const out = sortProductBoardDisplayColumns([
      'Dependency',
      'Status Details',
      'Status',
      'Feature Group',
    ])
    expect(out.indexOf('Status')).toBeLessThan(out.indexOf('Status Details'))
    expect(out.indexOf('Status Details')).toBeLessThan(out.indexOf('Dependency'))
  })

  it('places Input Source after Why / Expected Outcome', () => {
    const out = sortProductBoardDisplayColumns([
      'Priority',
      'Why / Expected Outcome',
      'Input Source',
      'Feature Group',
    ])
    const why = out.indexOf('Why / Expected Outcome')
    const src = out.indexOf('Input Source')
    expect(out[0]).toBe('Feature Group')
    expect(why).toBeGreaterThanOrEqual(0)
    expect(src).toBeGreaterThan(why)
  })
})
