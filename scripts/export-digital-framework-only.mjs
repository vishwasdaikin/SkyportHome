/**
 * Copies `Digital_Framework.xlsx` into `public/generated-roadmaps/` for production.
 * The Product Board loads this `.xlsx` in the browser (parsed with SheetJS — no JSON pipeline).
 *
 * Faster than full `npm run export-roadmaps` when you only changed the Product Board workbook.
 */
import fs from 'node:fs'
import path from 'node:path'
import { loadEnvFiles, resolveDigitalFrameworkWorkbook } from './workbook-paths.mjs'

const OUT_DIR = path.resolve(process.cwd(), 'public/generated-roadmaps')
const DEST_NAME = 'Digital_Framework.xlsx'

loadEnvFiles(process.cwd())

const cwd = process.cwd()
const digitalFramework = resolveDigitalFrameworkWorkbook(cwd)
if (!digitalFramework) {
  console.error(
    '[export-digital-framework] No workbook found. Add Digital_Framework.xlsx under OneDrive …/Skyport-Web-Shared-Test/.',
  )
  process.exit(1)
}

fs.mkdirSync(OUT_DIR, { recursive: true })
const dest = path.join(OUT_DIR, DEST_NAME)
fs.copyFileSync(digitalFramework.absPath, dest)
console.log(`[export-digital-framework] Copied → ${path.relative(process.cwd(), dest)}`)
