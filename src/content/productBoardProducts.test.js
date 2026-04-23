import { describe, it, expect } from 'vitest'
import {
  findWorkbookSheetName,
  findWorkbookSheetForProduct,
  normalizeWorkbookSheetKey,
} from './productBoardProducts'

describe('findWorkbookSheetName', () => {
  it('returns exact sheet name when present', () => {
    expect(findWorkbookSheetName(['MatchupXpress', 'Other'], 'MatchupXpress')).toBe('MatchupXpress')
  })

  it('matches case-insensitively', () => {
    expect(findWorkbookSheetName(['matchupxpress'], 'MatchupXpress')).toBe('matchupxpress')
  })

  it('ignores leading/trailing spaces on tab names', () => {
    expect(findWorkbookSheetName(['  MatchupXpress  '], 'MatchupXpress')).toBe('  MatchupXpress  ')
  })

  it('matches when the tab name includes a space', () => {
    expect(findWorkbookSheetName(['Template', 'Matchup Xpress'], 'MatchupXpress')).toBe('Matchup Xpress')
  })

  it('returns null when sheet missing', () => {
    expect(findWorkbookSheetName(['MatchupXpress'], 'TechHub')).toBe(null)
  })
})

describe('findWorkbookSheetForProduct', () => {
  const matchupProduct = {
    sheetName: 'MatchupXpress',
    sheetAliases: ['MatchXpress'],
  }

  it('picks MatchupXpress when Template is first', () => {
    expect(findWorkbookSheetForProduct(['Template', 'MatchupXpress'], matchupProduct)).toBe('MatchupXpress')
  })

  it('falls back to MatchXpress alias', () => {
    expect(findWorkbookSheetForProduct(['Template', 'MatchXpress'], matchupProduct)).toBe('MatchXpress')
  })

  it('resolves HVAC Learning Campus with alternate tab casing', () => {
    const hvacProduct = {
      sheetName: 'HVAC Learning Campus',
      sheetAliases: ['HVAC learning campus'],
    }
    expect(findWorkbookSheetForProduct(['Template', 'HVAC learning campus'], hvacProduct)).toBe('HVAC learning campus')
    expect(findWorkbookSheetForProduct(['HVAC Learning Campus'], hvacProduct)).toBe('HVAC Learning Campus')
  })
})

describe('normalizeWorkbookSheetKey', () => {
  it('collapses internal spaces for comparison', () => {
    expect(normalizeWorkbookSheetKey('Matchup Xpress')).toBe(normalizeWorkbookSheetKey('MatchupXpress'))
  })
})
