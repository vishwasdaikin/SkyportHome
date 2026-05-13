import { describe, it, expect } from 'vitest'
import {
  extractTableAfterSection,
  filterInsightTableColumns,
  formatDealerInsightsCell,
  parseDealerInsightsMeta,
  parseDealerInsightsNarrative,
  resolveDealerSummarySheetName,
  toDecimalFraction,
} from './dealerResearchInsights'

describe('dealerResearchInsights', () => {
  it('resolveDealerSummarySheetName prefers exact match', () => {
    expect(resolveDealerSummarySheetName(['Foo', 'Dealer Summary', 'Bar'])).toBe('Dealer Summary')
  })

  it('parseDealerInsightsMeta reads analysis date and total', () => {
    const grid = [
      ['DEALER INSIGHTS', '', ''],
      ['Analysis Date: Jan 1, 2026', '', ''],
      ['', '', ''],
      ['Total Dealers Analyzed:', 100, ''],
    ]
    expect(parseDealerInsightsMeta(grid)).toEqual({
      analysisDate: 'Jan 1, 2026',
      totalDealers: 100,
    })
  })

  it('extractTableAfterSection reads program block until blank', () => {
    const grid = [
      ['PROGRAM PARTICIPATION', '', '', ''],
      ['Program', 'Yes Count', 'No Count', '% Participation'],
      ['APlus', 1, 2, 0.5],
      ['Other', 3, 4, 0.25],
      ['', '', '', ''],
      ['SERVICE OFFERINGS', '', '', ''],
    ]
    const rows = extractTableAfterSection(grid, 'PROGRAM PARTICIPATION')
    expect(rows).toHaveLength(2)
    expect(rows[0].Program).toBe('APlus')
    expect(rows[1].Other).toBeUndefined()
    expect(rows[1].Program).toBe('Other')
  })

  it('parseDealerInsightsNarrative groups bullets under emoji headings', () => {
    const grid = [
      ['KEY INSIGHTS – TOTAL DEALER BASE', '', ''],
      ['', '', ''],
      ['📊 SECTION ONE:', '', ''],
      ['• First bullet', '', ''],
      ['• Second bullet', '', ''],
      ['📊 SECTION TWO:', '', ''],
      ['• Third', '', ''],
    ]
    const blocks = parseDealerInsightsNarrative(grid)
    expect(blocks).toHaveLength(2)
    expect(blocks[0].title).toContain('SECTION ONE')
    expect(blocks[0].bullets).toHaveLength(2)
    expect(blocks[1].bullets).toHaveLength(1)
  })

  it('toDecimalFraction handles decimals and percents', () => {
    expect(toDecimalFraction(0.29)).toBe(0.29)
    expect(toDecimalFraction('29%')).toBeCloseTo(0.29)
    expect(toDecimalFraction(29)).toBeCloseTo(0.29)
  })

  it('formatDealerInsightsCell formats counts and percent columns', () => {
    expect(formatDealerInsightsCell('% Participation', 0.295)).toBe('29.5%')
    expect(formatDealerInsightsCell('Yes Count', 3981)).toBe('3,981')
    expect(formatDealerInsightsCell('Program', 'APlus')).toBe('APlus')
    expect(formatDealerInsightsCell('Program', '')).toBe('—')
  })

  it('filterInsightTableColumns drops listed keys', () => {
    expect(
      filterInsightTableColumns([{ Program: 'x', 'No Count': 2, 'Yes Count': 3 }], ['No Count']),
    ).toEqual([{ Program: 'x', 'Yes Count': 3 }])
    expect(filterInsightTableColumns([{ a: 1, _col3: '' }], ['_col3'])).toEqual([{ a: 1 }])
  })
})
