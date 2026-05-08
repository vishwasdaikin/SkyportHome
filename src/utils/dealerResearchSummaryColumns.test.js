import { describe, it, expect } from 'vitest'
import {
  orderDealerSummaryColumnKeys,
  dealerSummaryColumnHeaderLabel,
  dealerSummaryKeysFromRows,
} from './dealerResearchSummaryColumns'

describe('dealerResearchSummaryColumns', () => {
  it('orders programs before HVAC tech columns', () => {
    const keys = orderDealerSummaryColumnKeys([
      'HVAC (Includes Heat Pumps)',
      'APlus',
      'Dealer Name',
      'Amana Advantage',
      'City',
      'Solar',
    ])
    expect(keys.slice(0, 6)).toEqual([
      'Dealer Name',
      'City',
      'Amana Advantage',
      'APlus',
      'HVAC (Includes Heat Pumps)',
      'Solar',
    ])
  })

  it('formats headers without parentheses and Offered suffix where requested', () => {
    expect(dealerSummaryColumnHeaderLabel('HVAC (Includes Heat Pumps)')).toBe('HVAC')
    expect(dealerSummaryColumnHeaderLabel('Hot Water (Includes HPWH)')).toBe('Hot Water')
    expect(dealerSummaryColumnHeaderLabel('Maintenance Plan Offered')).toBe('Maintenance Plan')
    expect(dealerSummaryColumnHeaderLabel('Membership Offered')).toBe('Membership')
    expect(dealerSummaryColumnHeaderLabel('Service Agreement / ESA')).toBe('Service Agreement / ESA')
    expect(dealerSummaryColumnHeaderLabel('Electrical (Panel / Service)')).toBe('Electrical Panel')
    expect(dealerSummaryColumnHeaderLabel('Electrification Ready (Derived)')).toBe('Electrification Ready')
  })

  it('dealerSummaryKeysFromRows dedupes and orders', () => {
    const rows = [
      { 'Dealer Name': 'A', City: 'X', State: 'Y', 'HVAC (Includes Heat Pumps)': 'Yes', APlus: 'Yes' },
      { 'Dealer Name': 'B', Solar: 'No', APlus: 'No' },
    ]
    const keys = dealerSummaryKeysFromRows(rows)
    expect(keys.indexOf('Dealer Name')).toBe(0)
    expect(keys.indexOf('APlus')).toBeLessThan(keys.indexOf('HVAC (Includes Heat Pumps)'))
  })
})
