/**
 * Writes public/generated-roadmaps/*.json from workbook files (production static files).
 * Dev still uses /local-data/*.json from the Vite plugin (live xlsx) so we avoid shadowing that with public/.
 * Run: npm run export-roadmaps
 *
 * Paths: optional env LOCAL_XLSX_FILE, LOCAL_SKYPORTCARE_XLSX_FILE, LOCAL_DIGITAL_PLATFORMS_XLSX_FILE
 * (absolute paths to OneDrive, etc.) or default *.xlsx in project root. Loads `.env` / `.env.local` first.
 *
 * SKIP_ROADMAP_EXPORT=1 — exit 0 without writing (use when JSON is already committed and xlsx absent in CI).
 */
import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'
import {
  loadEnvFiles,
  resolveSkyportHomeWorkbook,
  resolveSkyportCareWorkbook,
  resolveDigitalPlatformsWorkbook,
  resolveSupportGanttTestWorkbook,
  resolveDigitalFrameworkWorkbook,
} from './workbook-paths.mjs'

const OUT_DIR = path.resolve(process.cwd(), 'public/generated-roadmaps')

loadEnvFiles(process.cwd())

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

const cwd = process.cwd()
const home = resolveSkyportHomeWorkbook(cwd)
if (!home) {
  console.error(
    '[export-roadmaps] No home roadmap workbook found. Add SkyportHome_Roadmap.xlsx under OneDrive …/Skyport-Web-Shared-Test/, set LOCAL_XLSX_FILE, or add SkyportHome_Roadmap.xlsx / Test.xls / Test.xlsx in the project root.',
  )
  process.exit(1)
}

const care = resolveSkyportCareWorkbook(cwd)
if (!care) {
  console.error(
    '[export-roadmaps] No SkyportCare workbook found. Set LOCAL_SKYPORTCARE_XLSX_FILE or add SkyportCare_Roadmap.xlsx in the project root.',
  )
  process.exit(1)
}

const bm = resolveDigitalPlatformsWorkbook(cwd)
if (!bm) {
  console.error(
    '[export-roadmaps] No Digital Platforms business model workbook found. Set LOCAL_DIGITAL_PLATFORMS_XLSX_FILE or add Digital_Platforms_Business_Model.xlsx in the project root.',
  )
  process.exit(1)
}

console.log(`[export-roadmaps] SkyportHome: ${home.absPath}`)
console.log(`[export-roadmaps] SkyportCare: ${care.absPath}`)
console.log(`[export-roadmaps] Business model: ${bm.absPath}`)

writeJson('test-sheet.json', workbookToPayload(home.absPath, home.fileName))

const supportGantt = resolveSupportGanttTestWorkbook(cwd)
if (supportGantt) {
  console.log(`[export-roadmaps] Support Gantt (Test only): ${supportGantt.absPath}`)
  writeJson('support-gantt-test-sheet.json', workbookToPayload(supportGantt.absPath, supportGantt.fileName))
} else {
  console.warn(
    '[export-roadmaps] Skipped support-gantt-test-sheet.json (add Test.xlsx or Test.xls under OneDrive …/Skyport-Web-Shared-Test/).',
  )
}

const digitalFramework = resolveDigitalFrameworkWorkbook(cwd)
if (digitalFramework) {
  console.log(`[export-roadmaps] Digital Framework (Product Board): ${digitalFramework.absPath}`)
  writeJson('digital-framework.json', workbookToPayload(digitalFramework.absPath, digitalFramework.fileName))
} else {
  console.warn(
    '[export-roadmaps] Skipped digital-framework.json (add Digital_Framework.xlsx under OneDrive …/Skyport-Web-Shared-Test/).',
  )
}

writeJson('skyport-care-roadmap.json', workbookToPayload(care.absPath, care.fileName))
writeJson(
  'digital-platforms-business-model.json',
  workbookToGridPayload(bm.absPath, bm.fileName),
)
console.log('[export-roadmaps] Done.')
