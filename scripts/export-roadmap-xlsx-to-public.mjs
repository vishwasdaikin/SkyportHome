/**
 * Writes public/generated-roadmaps/*.json from root workbooks (production static files).
 * Dev still uses /local-data/*.json from the Vite plugin (live xlsx) so we avoid shadowing that with public/.
 * Run: npm run export-roadmaps
 *
 * SKIP_ROADMAP_EXPORT=1 — exit 0 without writing (use when JSON is already committed and xlsx absent in CI).
 */
import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

const OUT_DIR = path.resolve(process.cwd(), 'public/generated-roadmaps')

function resolveHomeWorkbookPath() {
  const envName = process.env.LOCAL_XLSX_FILE?.trim()
  const candidates = [envName || null, 'SkyportHome_Roadmap.xlsx', 'Test.xlsx'].filter(Boolean)
  for (const rel of candidates) {
    const abs = path.resolve(process.cwd(), rel)
    if (fs.existsSync(abs)) return { absPath: abs, fileName: rel }
  }
  return null
}

function workbookToPayload(absPath, fileName) {
  const buf = fs.readFileSync(absPath)
  const wb = XLSX.read(buf, { type: 'buffer' })
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
    workbook: fileName,
    sheetName: firstName,
    rows: firstName ? sheets[firstName] : [],
  }
}

function workbookToGridPayload(absPath, fileName) {
  const buf = fs.readFileSync(absPath)
  const wb = XLSX.read(buf, { type: 'buffer' })
  const grids = {}
  for (const name of wb.SheetNames) {
    const sh = wb.Sheets[name]
    grids[name] = XLSX.utils.sheet_to_json(sh, { header: 1, defval: '', raw: false })
  }
  return {
    workbook: fileName,
    sheetNames: wb.SheetNames,
    grids,
  }
}

function writeJson(fileName, payload) {
  const outPath = path.join(OUT_DIR, fileName)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(payload), 'utf8')
  console.log(`[export-roadmaps] Wrote ${path.relative(process.cwd(), outPath)} (${payload.sheetNames?.length ?? 0} sheets)`)
}

if (process.env.SKIP_ROADMAP_EXPORT === '1') {
  console.log('[export-roadmaps] Skipped (SKIP_ROADMAP_EXPORT=1). Using existing public/generated-roadmaps/*.json if any.')
  process.exit(0)
}

const home = resolveHomeWorkbookPath()
if (!home) {
  console.error(
    '[export-roadmaps] No home roadmap workbook found. Add one of: LOCAL_XLSX_FILE, SkyportHome_Roadmap.xlsx, Test.xlsx',
  )
  process.exit(1)
}

const carePath = path.resolve(process.cwd(), 'SkyportCare_Roadmap.xlsx')
if (!fs.existsSync(carePath)) {
  console.error('[export-roadmaps] Missing SkyportCare_Roadmap.xlsx in project root.')
  process.exit(1)
}

writeJson('test-sheet.json', workbookToPayload(home.absPath, home.fileName))
writeJson('skyport-care-roadmap.json', workbookToPayload(carePath, 'SkyportCare_Roadmap.xlsx'))

const bmPath = path.resolve(process.cwd(), 'Digital_Platforms_Business_Model.xlsx')
if (!fs.existsSync(bmPath)) {
  console.error('[export-roadmaps] Missing Digital_Platforms_Business_Model.xlsx in project root.')
  process.exit(1)
}
writeJson(
  'digital-platforms-business-model.json',
  workbookToGridPayload(bmPath, 'Digital_Platforms_Business_Model.xlsx'),
)
console.log('[export-roadmaps] Done.')
