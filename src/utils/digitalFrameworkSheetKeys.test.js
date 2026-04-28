import { describe, expect, it } from 'vitest'
import { sanitizeDigitalFrameworkSheetRows, trimDigitalFrameworkHeaderKey } from './digitalFrameworkSheetKeys'

describe('trimDigitalFrameworkHeaderKey', () => {
  it('strips BOM and trims NBSP around Source', () => {
    expect(trimDigitalFrameworkHeaderKey('\uFEFF\u00a0Source\u00a0')).toBe('Source')
  })
})

describe('sanitizeDigitalFrameworkSheetRows', () => {
  it('merges BOM-prefixed Source into Source', () => {
    const rows = [{ '\ufeffSource': 'VOC', Feature: 'x' }]
    const out = sanitizeDigitalFrameworkSheetRows(rows)
    expect(out[0]).toEqual({ Source: 'VOC', Feature: 'x' })
  })

  it('drops xlsx __EMPTY header placeholder columns', () => {
    const rows = [{ Feature: 'a', __EMPTY: '', __EMPTY_1: 'noise' }]
    const out = sanitizeDigitalFrameworkSheetRows(rows)
    expect(out[0]).toEqual({ Feature: 'a' })
  })
})
