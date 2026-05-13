import { describe, it, expect } from 'vitest'
import {
  findGroupColumnKey,
  withDisplayGroup,
  buildGroupsFromRows,
  filterProductBoardRows,
  isLikelyTemplateRow,
} from './productBoardRoadmapView'

describe('findGroupColumnKey', () => {
  it('returns Feature Group when present', () => {
    expect(findGroupColumnKey(['Theme', 'Feature Group', 'Detail'])).toBe('Feature Group')
  })

  it('returns null when absent', () => {
    expect(findGroupColumnKey(['A', 'B'])).toBe(null)
  })
})

describe('withDisplayGroup', () => {
  it('forward-fills display group', () => {
    const rows = [
      { g: 'Alpha', x: 1 },
      { g: '', x: 2 },
      { g: 'Beta', x: 3 },
      { g: '', x: 4 },
    ]
    const out = withDisplayGroup(rows, 'g')
    expect(out.map((r) => r.__displayGroup)).toEqual(['Alpha', 'Alpha', 'Beta', 'Beta'])
  })
})

describe('buildGroupsFromRows', () => {
  it('preserves first-seen group order', () => {
    const rows = [
      { __displayGroup: 'B', n: 1 },
      { __displayGroup: 'A', n: 2 },
      { __displayGroup: 'B', n: 3 },
    ]
    const g = buildGroupsFromRows(rows)
    expect(g.map((x) => x.groupName)).toEqual(['B', 'A'])
    expect(g[0].rows).toHaveLength(2)
    expect(g[1].rows).toHaveLength(1)
  })
})

describe('filterProductBoardRows', () => {
  it('filters by any column and display group', () => {
    const rows = [{ __displayGroup: 'G1', a: 'hello', b: 'x' }]
    expect(filterProductBoardRows(rows, ['a', 'b'], 'ell')).toEqual(rows)
    expect(filterProductBoardRows(rows, ['a', 'b'], 'g1')).toEqual(rows)
    expect(filterProductBoardRows(rows, ['a', 'b'], 'zzz')).toEqual([])
  })

  it('matches search against canonical Source when row uses spaced source key', () => {
    const rows = [{ __displayGroup: 'G', ' Source': 'Internal Team', a: 'x' }]
    expect(filterProductBoardRows(rows, ['Source', 'a'], 'internal')).toEqual(rows)
  })
})

describe('isLikelyTemplateRow', () => {
  it('detects template feature cell', () => {
    const cols = ['Feature Group', 'Feature / Function']
    expect(
      isLikelyTemplateRow({ 'Feature / Function': 'Short, clear feature name', 'Feature Group': 'X' }, cols),
    ).toBe(true)
  })
})
