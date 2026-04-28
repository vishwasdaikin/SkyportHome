/**
 * Sanity-check for `npm run watch:digital-framework:auto-commit`:
 * - Resolves `Digital_Framework.xlsx`
 * - Runs single-file copy into `public/generated-roadmaps/`
 * - Shows `git diff` for `Digital_Framework.xlsx` only (does not stage or commit)
 *
 * Usage: npm run verify:digital-framework:auto-commit
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnvFiles, resolveDigitalFrameworkWorkbook } from './workbook-paths.mjs'

loadEnvFiles(process.cwd())

const cwd = process.cwd()
const relWorkbook = 'public/generated-roadmaps/Digital_Framework.xlsx'
const scriptDir = path.dirname(fileURLToPath(import.meta.url))

function run(cmd, args) {
  return spawnSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

const wb = resolveDigitalFrameworkWorkbook(cwd)
if (!wb) {
  console.log('[verify:digital-framework:auto-commit] SKIP: Digital_Framework.xlsx not found (add under …/Skyport-Web-Shared-Test/).')
  process.exit(0)
}

console.log('[verify:digital-framework:auto-commit] Workbook:', wb.absPath)

const exportScript = path.join(scriptDir, 'export-digital-framework-only.mjs')
const ex = run(process.execPath, [exportScript])
if (ex.stdout) process.stdout.write(ex.stdout)
if (ex.stderr) process.stderr.write(ex.stderr)
if (ex.status !== 0) {
  console.error('[verify:digital-framework:auto-commit] Export failed.')
  process.exit(1)
}

const diff = run('git', ['diff', '--stat', '--', relWorkbook])
const diffFull = run('git', ['diff', '--quiet', '--', relWorkbook])
if (diffFull.status === 0) {
  console.log('[verify:digital-framework:auto-commit] OK: file matches git HEAD (export matched repo).')
  process.exit(0)
}

console.log('[verify:digital-framework:auto-commit] OK: export changed tracked file (vs HEAD):')
console.log(diff.stdout || '(stat empty)')
console.log('[verify:digital-framework:auto-commit] Only', relWorkbook, 'is touched by export-digital-framework-only — safe for auto-commit.')
process.exit(0)
