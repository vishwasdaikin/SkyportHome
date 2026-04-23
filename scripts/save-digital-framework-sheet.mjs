/**
 * Product Board dev save: update cell values while preserving Excel formatting.
 * Uses ExcelJS (not SheetJS) because SheetJS CE re-derives styles from numFmt only on write.
 */
import fs from 'node:fs'
import ExcelJS from 'exceljs'
import { findWorkbookSheetName } from '../src/content/productBoardProducts.js'

export function cellToSaveString(value) {
  if (value == null) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function cellDisplayString(cell) {
  const v = cell.value
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'object') {
    if (Array.isArray(v.richText)) return v.richText.map((p) => p.text).join('')
    if (v.text != null && v.hyperlink != null) return String(v.text)
    if ('formula' in v || 'sharedFormula' in v) {
      const r = v.result
      return r == null ? '' : String(r)
    }
  }
  return String(v)
}

/**
 * @param {string[]} clientColumns
 * @param {string[]} headerValues
 */
function mapClientColumnsToRelativeIndices(clientColumns, headerValues) {
  const width = headerValues.length
  const indices = []
  const used = new Set()
  let nextNew = width
  for (const colName of clientColumns) {
    const want = String(colName ?? '').trim()
    let rel = -1
    if (want) {
      for (let i = 0; i < width; i++) {
        if (used.has(i)) continue
        const h = String(headerValues[i] ?? '').trim()
        if (h === want) {
          rel = i
          break
        }
      }
      if (rel < 0) {
        for (let i = 0; i < width; i++) {
          if (used.has(i)) continue
          const h = String(headerValues[i] ?? '').trim()
          if (h.toLowerCase() === want.toLowerCase()) {
            rel = i
            break
          }
        }
      }
    }
    if (rel < 0) {
      for (let i = 0; i < width; i++) {
        if (!used.has(i)) {
          rel = i
          break
        }
      }
    }
    if (rel < 0) {
      rel = nextNew
      nextNew += 1
    }
    used.add(rel)
    indices.push(rel)
  }
  return indices
}

function setCellScalar(cell, raw) {
  const str = cellToSaveString(raw)
  const s0 = str.trim()
  if (s0 === '') {
    cell.value = null
    return
  }
  const n = Number(s0)
  if (Number.isFinite(n) && !/^0\d/.test(s0) && String(n) === s0) {
    cell.value = n
  } else {
    cell.value = str
  }
}

/** @param {Buffer} out */
export function writeBufferAtomic(absPath, out) {
  const tmp = `${absPath}.${process.pid}.${Date.now()}.tmp`
  fs.writeFileSync(tmp, out)
  try {
    fs.renameSync(tmp, absPath)
  } catch {
    try {
      fs.unlinkSync(tmp)
    } catch {
      /* ignore */
    }
    fs.writeFileSync(absPath, out)
  }
}

/**
 * @param {string} absPath
 * @param {string} sheetNameHint
 * @param {string[]} columns
 * @param {Record<string, unknown>[]} rows
 * @returns {Promise<{ actualSheetName: string, rowCount: number }>}
 */
export async function saveDigitalFrameworkSheet(absPath, sheetNameHint, columns, rows) {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(absPath)
  const names = wb.worksheets.map((w) => w.name)
  const actualSheetName = findWorkbookSheetName(names, sheetNameHint)
  if (!actualSheetName) {
    const err = new Error(`Unknown sheet: ${sheetNameHint}`)
    /** @type {any} */ (err).sheetNamesInFile = names
    throw err
  }
  const sheet = wb.getWorksheet(actualSheetName)
  if (!sheet) {
    throw new Error(`Worksheet missing: ${actualSheetName}`)
  }

  const dim = sheet.dimensions
  if (!dim || dim.top == null || dim.left == null) {
    throw new Error('Sheet has no dimensions (empty tab); cannot map columns.')
  }

  const headerRowNum = dim.top
  const leftCol = dim.left
  const rightCol = dim.right
  const headerRow = sheet.getRow(headerRowNum)
  const headerTexts = []
  for (let c = leftCol; c <= rightCol; c++) {
    headerTexts.push(cellDisplayString(headerRow.getCell(c)).trim())
  }

  const relIndices = mapClientColumnsToRelativeIndices(columns, headerTexts)
  const colNumbers = relIndices.map((rel) => leftCol + rel)

  for (let j = 0; j < columns.length; j++) {
    const c = colNumbers[j]
    const cell = headerRow.getCell(c)
    const next = String(columns[j] ?? '').trim()
    if (cellDisplayString(cell).trim() === next) continue
    setCellScalar(cell, columns[j])
  }

  const dataFirstRow = headerRowNum + 1
  const oldBottom = dim.bottom
  const lastDataRow = rows.length === 0 ? headerRowNum : dataFirstRow + rows.length - 1

  if (lastDataRow > oldBottom) {
    for (let r = oldBottom + 1; r <= lastDataRow; r++) {
      const templateRow = sheet.getRow(r - 1)
      const targetRow = sheet.getRow(r)
      for (const colNum of colNumbers) {
        const src = templateRow.getCell(colNum)
        const dst = targetRow.getCell(colNum)
        if (src.style && Object.keys(src.style).length > 0) {
          try {
            dst.style = JSON.parse(JSON.stringify(src.style))
          } catch {
            /* ignore clone failures */
          }
        }
      }
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const r = dataFirstRow + i
    const row = sheet.getRow(r)
    const rowObj =
      rows[i] && typeof rows[i] === 'object' && !Array.isArray(rows[i]) ? rows[i] : {}
    for (let j = 0; j < columns.length; j++) {
      setCellScalar(row.getCell(colNumbers[j]), rowObj[columns[j]])
    }
  }

  for (let r = lastDataRow + 1; r <= oldBottom; r++) {
    const row = sheet.getRow(r)
    for (let j = 0; j < columns.length; j++) {
      row.getCell(colNumbers[j]).value = null
    }
  }

  const buf = await wb.xlsx.writeBuffer()
  writeBufferAtomic(absPath, Buffer.from(buf))
  return { actualSheetName, rowCount: rows.length }
}
