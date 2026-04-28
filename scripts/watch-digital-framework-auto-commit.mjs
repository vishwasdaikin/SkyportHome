/**
 * Watches `Digital_Framework.xlsx`; on save: copy to `public/generated-roadmaps/` → git commit that file only (optional push).
 *
 * Layman: leaving this running in a terminal automates "copy + commit" so you don't have to remember.
 * Live site still updates only after those commits reach your host (e.g. Vercel deploy) OR you use a hosted workbook URL (`xlsxUrl` / `VITE_DIGITAL_FRAMEWORK_XLSX_URL`).
 *
 * Usage:
 *   npm run watch:digital-framework:auto-commit
 *
 * Env:
 *   AUTO_PUSH=1           — also `git push` after each commit (needs auth / upstream).
 *   GIT_BRANCH=main       — optional; verify you're on this branch before commit (empty = skip check).
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { loadEnvFiles, resolveDigitalFrameworkWorkbook } from './workbook-paths.mjs'

loadEnvFiles(process.cwd())

const cwd = process.cwd()
const relWorkbook = 'public/generated-roadmaps/Digital_Framework.xlsx'
const scriptDir = path.dirname(fileURLToPath(import.meta.url))

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  })
  return { status: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }
}

function gitAvailable() {
  const r = run('git', ['rev-parse', '--git-dir'])
  return r.status === 0
}

function exportDigitalFramework() {
  const exportScript = path.join(scriptDir, 'export-digital-framework-only.mjs')
  const r = run(process.execPath, [exportScript])
  if (r.stderr) process.stderr.write(r.stderr)
  if (r.stdout) process.stdout.write(r.stdout)
  return r.status === 0
}

function commitWorkbookIfChanged() {
  run('git', ['add', '--', relWorkbook])
  /** Scope to this path only — ignores unrelated staged files elsewhere in the index. */
  const staged = run('git', ['diff', '--cached', '--quiet', '--', relWorkbook])
  if (staged.status === 0) {
    console.log('[watch-digital-framework] No change to', relWorkbook, '— skip commit.')
    return
  }

  const msg = `chore(product-board): sync Digital_Framework.xlsx → public/generated-roadmaps`
  const commit = run('git', ['commit', '-m', msg, '--', relWorkbook])
  if (commit.status !== 0) {
    console.error('[watch-digital-framework] git commit failed:', commit.stderr || commit.stdout)
    return
  }
  console.log('[watch-digital-framework] Committed', relWorkbook)

  if (process.env.AUTO_PUSH === '1') {
    const push = run('git', ['push'])
    if (push.status !== 0) {
      console.error('[watch-digital-framework] git push failed:', push.stderr || push.stdout)
      return
    }
    console.log('[watch-digital-framework] Pushed.')
  }
}

const wb = resolveDigitalFrameworkWorkbook(cwd)
if (!wb) {
  console.error(
    '[watch-digital-framework] No Digital_Framework.xlsx found (Skyport-Web-Shared-Test). Cannot watch.',
  )
  process.exit(1)
}

if (!gitAvailable()) {
  console.error('[watch-digital-framework] Not a git repository; auto-commit disabled.')
  process.exit(1)
}

const branchCheck = process.env.GIT_BRANCH?.trim()
if (branchCheck) {
  const cur = run('git', ['branch', '--show-current'])
  const name = (cur.stdout || '').trim()
  if (name !== branchCheck) {
    console.error(`[watch-digital-framework] On branch "${name}", expected "${branchCheck}". Exit or unset GIT_BRANCH.`)
    process.exit(1)
  }
}

const watchPath = wb.absPath
console.log('[watch-digital-framework] Watching:', watchPath)
console.log('[watch-digital-framework] On Excel save: copy → commit', relWorkbook)
if (process.env.AUTO_PUSH === '1') console.log('[watch-digital-framework] AUTO_PUSH=1 — will push after each commit.')
else console.log('[watch-digital-framework] Tip: AUTO_PUSH=1 npm run watch:digital-framework:auto-commit — to push automatically.')

let timer = null
function schedule() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    if (!exportDigitalFramework()) return
    commitWorkbookIfChanged()
  }, 1500)
}

try {
  fs.watch(watchPath, { persistent: true }, (eventType) => {
    if (eventType !== 'change' && eventType !== 'rename') return
    schedule()
  })
} catch (e) {
  console.error('[watch-digital-framework] fs.watch failed:', e)
  process.exit(1)
}
