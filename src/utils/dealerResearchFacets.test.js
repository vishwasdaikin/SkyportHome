import { describe, it, expect } from 'vitest'
import {
  dealerResearchNormCell,
  applyDealerResearchFacets,
  buildDealerFacetOptions,
} from './dealerResearchFacets'

describe('dealerResearchFacets', () => {
  it('normalizes cells', () => {
    expect(dealerResearchNormCell(' Yes ')).toBe('yes')
    expect(dealerResearchNormCell('')).toBe('')
  })

  it('applyDealerResearchFacets ANDs columns', () => {
    const rows = [
      { s: 'TX', y: 'Yes' },
      { s: 'TX', y: 'No' },
      { s: 'CA', y: 'Yes' },
    ]
    const keys = ['s', 'y']
    const f = { s: ['tx'], y: ['yes'] }
    expect(applyDealerResearchFacets(rows, f, keys)).toEqual([{ s: 'TX', y: 'Yes' }])
  })

  it('buildDealerFacetOptions groups and counts', () => {
    const rows = [{ c: 'Yes' }, { c: 'yes' }, { c: '' }]
    const opts = buildDealerFacetOptions(rows, 'c')
    expect(opts.find((o) => o.norm === 'yes')?.count).toBe(2)
    expect(opts.find((o) => o.norm === '')?.label).toBe('(blank)')
  })
})
