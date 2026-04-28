/**
 * One-shot: copy `Digital_Framework.xlsx` → `public/generated-roadmaps/Digital_Framework.xlsx`,
 * then commit (and optionally push) if the file changed.
 *
 * Use when Excel lives on OneDrive and you want a **scheduled** update (daily cron / launchd),
 * instead of `watch:digital-framework:auto-commit` (runs on every Excel save while the terminal stays open).
 *
 * Same script as `npm run save-commit-sync` (alias).
 *
 * Schedule example (macOS cron, 9:00 local time daily):
 *   0 9 * * * cd /full/path/to/Skyport-Web && AUTO_PUSH=1 /usr/local/bin/npm run save-commit-sync
 *
 * Requires: machine on at run time, OneDrive synced, repo clean enough to commit this file, git auth for push.
 *
 * Env: AUTO_PUSH=1, GIT_BRANCH=main (optional; same as watch script).
 */
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
  const staged = run('git', ['diff', '--cached', '--quiet', '--', relWorkbook])
  if (staged.status === 0) {
    console.log('[daily-digital-framework] No change to', relWorkbook, '— skip commit.')
    return
  }

  const msg = `chore(product-board): sync Digital_Framework.xlsx → public/generated-roadmaps`
  const commit = run('git', ['commit', '-m', msg, '--', relWorkbook])
  if (commit.status !== 0) {
    console.error('[daily-digital-framework] git commit failed:', commit.stderr || commit.stdout)
    process.exit(1)
  }
  console.log('[daily-digital-framework] Committed', relWorkbook)

  if (process.env.AUTO_PUSH === '1') {
    const push = run('git', ['push'])
    if (push.status !== 0) {
      console.error('[daily-digital-framework] git push failed:', push.stderr || push.stdout)
      process.exit(1)
    }
    console.log('[daily-digital-framework] Pushed.')
  }
}

const wb = resolveDigitalFrameworkWorkbook(cwd)
if (!wb) {
  console.error(
    '[daily-digital-framework] No Digital_Framework.xlsx found under …/Skyport-Web-Shared-Test/.',
  )
  process.exit(1)
}

if (!gitAvailable()) {
  console.error('[daily-digital-framework] Not a git repository.')
  process.exit(1)
}

const branchCheck = process.env.GIT_BRANCH?.trim()
if (branchCheck) {
  const cur = run('git', ['branch', '--show-current'])
  const name = (cur.stdout || '').trim()
  if (name !== branchCheck) {
    console.error(`[daily-digital-framework] On branch "${name}", expected "${branchCheck}". Exit or unset GIT_BRANCH.`)
    process.exit(1)
  }
}

console.log('[daily-digital-framework] Source workbook:', wb.absPath)
if (!exportDigitalFramework()) process.exit(1)
commitWorkbookIfChanged()
