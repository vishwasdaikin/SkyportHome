import * as XLSX from 'xlsx'

/**
 * Same shape as legacy JSON export: Product Board + hooks expect `sheetNames`, `sheets`, `workbook`.
 * @param {ArrayBuffer} buf
 * @param {string} [workbookLabel]
 */
export function parseDigitalFrameworkFromArrayBuffer(buf, workbookLabel = 'Digital_Framework.xlsx') {
  const wb = XLSX.read(buf, { type: 'array' })
  const sheetNames = wb.SheetNames
  const sheets = {}
  for (const name of sheetNames) {
    const sh = wb.Sheets[name]
    sheets[name] = XLSX.utils.sheet_to_json(sh, { defval: null, raw: false })
  }
  const firstName = sheetNames[0] ?? null
  return {
    sheetNames,
    sheets,
    workbook: workbookLabel,
    sheetName: firstName,
    rows: firstName ? sheets[firstName] : [],
  }
}
