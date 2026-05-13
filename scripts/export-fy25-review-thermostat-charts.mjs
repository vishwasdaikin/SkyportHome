/**
 * Writes `public/generated-roadmaps/fy25-review-thermostat-charts.json` from project-root `Test.xlsx`
 * sheets FY23, FY24, FY25 (same layout as Digital Platform FY25 Review charts).
 *
 * Run via `npm run export-roadmaps` (chained) or: `node scripts/export-fy25-review-thermostat-charts.mjs`
 * Exit 0 with skip message if `Test.xlsx` is missing.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'
import { buildFy25ReviewThermostatChartsPayload } from '../src/utils/buildFy25ReviewThermostatChartsPayload.js'

const cwd = process.cwd()
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
void scriptDir

const testPath = path.join(cwd, 'Test.xlsx')
if (!fs.existsSync(testPath)) {
  console.log('[export-fy25-review-charts] Skip: Test.xlsx not in project root.')
  process.exit(0)
}

const wb = XLSX.read(fs.readFileSync(testPath), { type: 'buffer' })
const grids = {}
for (const name of ['FY23', 'FY24', 'FY25']) {
  if (!wb.Sheets[name]) {
    console.error('[export-fy25-review-charts] Missing sheet:', name)
    process.exit(1)
  }
  grids[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', raw: false })
}

const payload = buildFy25ReviewThermostatChartsPayload(grids)
if (!payload) {
  console.error('[export-fy25-review-charts] Failed to build payload from FY23–FY25 sheets.')
  process.exit(1)
}

const outPath = path.join(cwd, 'public/generated-roadmaps/fy25-review-thermostat-charts.json')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(payload)}\n`, 'utf8')
console.log('[export-fy25-review-charts] Wrote', path.relative(cwd, outPath))
