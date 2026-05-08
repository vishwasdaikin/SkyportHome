/**
 * Shared resolution for roadmap / business-model workbooks.
 * Env (optional): LOCAL_XLSX_FILE, LOCAL_SKYPORTCARE_XLSX_FILE, LOCAL_DIGITAL_PLATFORMS_XLSX_FILE
 * Values may be absolute paths (e.g. synced OneDrive) or relative to project cwd.
 *
 * SkyportHome / SkyportCare roadmaps default to `…/OneDrive…/Skyport-Web-Shared-Test/*.xlsx`
 * (see `collectSkyportWebShared*`), then fall back to the project root.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/** Team-synced folder next to other roadmaps (OneDrive personal / business sync roots). */
const SKYPORT_WEB_SHARED_TEST = 'Skyport-Web-Shared-Test'

/** @returns {string[]} sorted absolute OneDrive sync root directories */
function listSortedOneDriveSyncRootDirs() {
  const home = os.homedir()
  /** @type {string[]} */
  const oneDriveRoots = []
  const addRoot = (dir) => {
    if (!dir || oneDriveRoots.includes(dir)) return
    try {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) oneDriveRoots.push(dir)
    } catch {
      /* ignore */
    }
  }

  const cloudStorage = path.join(home, 'Library', 'CloudStorage')
  if (fs.existsSync(cloudStorage)) {
    try {
      for (const name of fs.readdirSync(cloudStorage)) {
        if (!/^OneDrive/i.test(name)) continue
        addRoot(path.join(cloudStorage, name))
      }
    } catch {
      /* ignore */
    }
  }

  try {
    for (const name of fs.readdirSync(home)) {
      if (!/^OneDrive/i.test(name)) continue
      addRoot(path.join(home, name))
    }
  } catch {
    /* ignore */
  }

  oneDriveRoots.sort()
  return oneDriveRoots
}

/**
 * Absolute paths to `Test.xls` / `Test.xlsx` under each OneDrive sync root, in
 * `Skyport-Web-Shared-Test` (macOS: Library/CloudStorage/OneDrive-…, plus home/OneDrive…).
 * @returns {string[]}
 */
export function collectSkyportWebSharedTestWorkbookPaths() {
  /** @type {string[]} */
  const files = []
  for (const root of listSortedOneDriveSyncRootDirs()) {
    const shared = path.join(root, SKYPORT_WEB_SHARED_TEST)
    files.push(path.join(shared, 'Test.xlsx'), path.join(shared, 'Test.xls'))
  }
  return files
}

/**
 * `Digital_Framework.xlsx` under `Skyport-Web-Shared-Test` only (Product Board page).
 * @returns {string[]}
 */
export function collectSkyportWebSharedDigitalFrameworkPaths() {
  /** @type {string[]} */
  const files = []
  for (const root of listSortedOneDriveSyncRootDirs()) {
    files.push(path.join(root, SKYPORT_WEB_SHARED_TEST, 'Digital_Framework.xlsx'))
  }
  return files
}

/**
 * `SkyportHome_Roadmap.xlsx` under each `…/Skyport-Web-Shared-Test/` (App Suite SkyportHome / export).
 * @returns {string[]}
 */
export function collectSkyportWebSharedHomeRoadmapPaths() {
  /** @type {string[]} */
  const files = []
  for (const root of listSortedOneDriveSyncRootDirs()) {
    files.push(path.join(root, SKYPORT_WEB_SHARED_TEST, 'SkyportHome_Roadmap.xlsx'))
  }
  return files
}

/**
 * `SkyportCare_Roadmap.xlsx` under each `…/Skyport-Web-Shared-Test/` (App Suite SkyportCare / export).
 * @returns {string[]}
 */
export function collectSkyportWebSharedCareRoadmapPaths() {
  /** @type {string[]} */
  const files = []
  for (const root of listSortedOneDriveSyncRootDirs()) {
    files.push(path.join(root, SKYPORT_WEB_SHARED_TEST, 'SkyportCare_Roadmap.xlsx'))
  }
  return files
}

/**
 * `Dealer_Research.xlsx` under `…/Skyport-Web-Shared-Test/` (App Suite SkyportCare · Dealer Research tab).
 * @returns {string[]}
 */
export function collectSkyportWebSharedDealerResearchPaths() {
  /** @type {string[]} */
  const files = []
  for (const root of listSortedOneDriveSyncRootDirs()) {
    files.push(path.join(root, SKYPORT_WEB_SHARED_TEST, 'Dealer_Research.xlsx'))
  }
  return files
}

/**
 * Product Board — **only** `…/Skyport-Web-Shared-Test/Digital_Framework.xlsx`.
 */
export function resolveDigitalFrameworkWorkbook(cwd, _env = process.env) {
  return resolveFirstExisting(cwd, collectSkyportWebSharedDigitalFrameworkPaths())
}

function parseDotenvLine(line) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null
  const eq = trimmed.indexOf('=')
  if (eq === -1) return null
  const key = trimmed.slice(0, eq).trim()
  let val = trimmed.slice(eq + 1).trim()
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1)
  }
  return { key, val }
}

/** Load `.env` then `.env.local` (later overrides) into process.env for Node scripts. */
export function loadEnvFiles(cwd = process.cwd()) {
  const apply = (filePath) => {
    if (!fs.existsSync(filePath)) return
    const content = fs.readFileSync(filePath, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const parsed = parseDotenvLine(line)
      if (!parsed) continue
      process.env[parsed.key] = parsed.val
    }
  }
  apply(path.join(cwd, '.env'))
  apply(path.join(cwd, '.env.local'))
}

function resolveFirstExisting(cwd, candidates) {
  for (const raw of candidates) {
    if (raw == null || String(raw).trim() === '') continue
    const p = String(raw).trim()
    const abs = path.resolve(cwd, p)
    if (fs.existsSync(abs)) {
      return { absPath: abs, fileName: path.basename(abs) }
    }
  }
  return null
}

/**
 * SkyportHome roadmap — dev `/local-data/test-sheet.json` + `npm run export-roadmaps`.
 * Order: `LOCAL_XLSX_FILE`, then each `…/Skyport-Web-Shared-Test/SkyportHome_Roadmap.xlsx`, then project root.
 */
export function resolveSkyportHomeWorkbook(cwd, env = process.env) {
  return resolveFirstExisting(cwd, [
    env.LOCAL_XLSX_FILE,
    ...collectSkyportWebSharedHomeRoadmapPaths(),
    'SkyportHome_Roadmap.xlsx',
    'Test.xls',
    'Test.xlsx',
  ])
}

/**
 * Support → Test page · timeline Gantt only — not SkyportHome_Roadmap.xlsx.
 * **Only** `…/OneDrive…/Skyport-Web-Shared-Test/Test.xlsx` or `Test.xls` (see `collectSkyportWebSharedTestWorkbookPaths`).
 * No project root, no `LOCAL_*` override — keeps the timeline tied to the shared OneDrive folder.
 */
export function resolveSupportGanttTestWorkbook(cwd, _env = process.env) {
  return resolveFirstExisting(cwd, collectSkyportWebSharedTestWorkbookPaths())
}

export function resolveSkyportCareWorkbook(cwd, env = process.env) {
  return resolveFirstExisting(cwd, [
    env.LOCAL_SKYPORTCARE_XLSX_FILE,
    ...collectSkyportWebSharedCareRoadmapPaths(),
    'SkyportCare_Roadmap.xlsx',
  ])
}

export function resolveDigitalPlatformsWorkbook(cwd, env = process.env) {
  return resolveFirstExisting(cwd, [
    env.LOCAL_DIGITAL_PLATFORMS_XLSX_FILE,
    'Digital_Platforms_Business_Model.xlsx',
  ])
}

/** Dealer research workbook — optional env `LOCAL_DEALER_RESEARCH_XLSX_FILE`. */
export function resolveDealerResearchWorkbook(cwd, env = process.env) {
  return resolveFirstExisting(cwd, [
    env.LOCAL_DEALER_RESEARCH_XLSX_FILE,
    ...collectSkyportWebSharedDealerResearchPaths(),
    'Dealer_Research.xlsx',
  ])
}

/** Sheets shipped to the web UI (excludes large raw extracts like `Dealers_Raw`). */
export function filterDealerResearchSheetNamesForWeb(sheetNames) {
  if (!Array.isArray(sheetNames)) return []
  const keep = sheetNames.filter(
    (n) =>
      /^dealer\s*summary$/i.test(String(n).trim()) ||
      /dealer\s*insights/i.test(String(n)),
  )
  return keep.length ? keep : sheetNames
}
