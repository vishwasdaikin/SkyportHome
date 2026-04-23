/**
 * Dev-only: serves JSON from local workbooks on GET so Excel saves are reflected without rebuilding.
 *
 * `POST /local-data/digital-framework-save` — writes table values via ExcelJS so fonts/fills/widths survive (Product Board edit; dev server only).
 *
 * `/local-data/support-gantt-test-sheet.json` → only OneDrive `…/Skyport-Web-Shared-Test/Test.xlsx` or `Test.xls`.
 * `/local-data/digital-framework.json` → only OneDrive `…/Skyport-Web-Shared-Test/Digital_Framework.xlsx`.
 * `/local-data/test-sheet.json` → `LOCAL_XLSX_FILE`, `SkyportHome_Roadmap.xlsx`, `Test.xls`, `Test.xlsx`.
 * `viteEnv` is Vite `loadEnv()` so `.env.local` paths apply without exporting in the shell.
 */
import fs from 'node:fs'
import * as XLSX from 'xlsx'
import {
  resolveSkyportHomeWorkbook,
  resolveSkyportCareWorkbook,
  resolveDigitalPlatformsWorkbook,
  resolveSupportGanttTestWorkbook,
  resolveDigitalFrameworkWorkbook,
} from './scripts/workbook-paths.mjs'
function mergedEnv(viteEnv) {
  return { ...process.env, ...viteEnv }
}

/** Strip Vite `base` prefix from request path so `/Repo/local-data/...` matches `/local-data/...`. */
function normalizeViteRequestPath(urlPath, base) {
  let u = urlPath || '/'
  const b = base === '/' ? '' : (base.endsWith('/') ? base.slice(0, -1) : base)
  if (b && u.startsWith(b)) u = u.slice(b.length) || '/'
  if (!u.startsWith('/')) u = `/${u}`
  return u
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function sendWorkbookJson(res, filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: 'Workbook not found',
        path: filePath,
        workbook: fileName,
      }),
    )
    return
  }
  const buf = fs.readFileSync(filePath)
  const wb = XLSX.read(buf, { type: 'buffer' })
  const sheetNames = wb.SheetNames
  const sheets = {}
  for (const name of sheetNames) {
    const sh = wb.Sheets[name]
    sheets[name] = XLSX.utils.sheet_to_json(sh, { defval: null, raw: false })
  }
  const firstName = sheetNames[0] ?? null
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.end(
    JSON.stringify({
      sheetNames,
      sheets,
      workbook: fileName,
      /** @deprecated use sheets[name] — kept for older callers */
      sheetName: firstName,
      rows: firstName ? sheets[firstName] : [],
    }),
  )
}

export default function localTestXlsx(viteEnv = {}, basePath = '/') {
  return {
    name: 'local-test-xlsx',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlRaw = req.url?.split('?')[0] ?? ''
        const url = normalizeViteRequestPath(urlRaw, basePath)
        const env = mergedEnv(viteEnv)
        const cwd = process.cwd()

        if (req.method === 'POST' && url === '/local-data/digital-framework-save') {
          const sendJson = (code, obj) => {
            res.statusCode = code
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(obj))
          }
          readJsonBody(req)
            .then(async (body) => {
              try {
                const resolved = resolveDigitalFrameworkWorkbook(cwd, env)
                if (!resolved) {
                  sendJson(404, { error: 'Digital Framework workbook not found' })
                  return
                }
                const { sheetName, columns, rows } = body
                if (!sheetName || typeof sheetName !== 'string') {
                  sendJson(400, { error: 'Missing sheetName' })
                  return
                }
                if (!Array.isArray(columns) || columns.length === 0) {
                  sendJson(400, { error: 'Missing columns' })
                  return
                }
                if (!Array.isArray(rows)) {
                  sendJson(400, { error: 'Missing rows' })
                  return
                }
                if (columns.length > 80 || rows.length > 5000) {
                  sendJson(400, { error: 'Payload too large' })
                  return
                }
                const { saveDigitalFrameworkSheet } = await import('./scripts/save-digital-framework-sheet.mjs')
                const { actualSheetName, rowCount } = await saveDigitalFrameworkSheet(
                  resolved.absPath,
                  sheetName,
                  columns,
                  rows,
                )
                console.log(
                  '[local-test-xlsx] Digital Framework saved (ExcelJS)',
                  resolved.absPath,
                  `tab="${actualSheetName}"`,
                  `${rowCount} data row(s)`,
                )
                sendJson(200, {
                  ok: true,
                  workbook: resolved.fileName,
                  sheetName: actualSheetName,
                  rowCount,
                  savedPath: resolved.absPath,
                })
              } catch (err) {
                const names = err?.sheetNamesInFile
                if (names) {
                  sendJson(400, {
                    error: err?.message || String(err),
                    sheetNamesInFile: names,
                  })
                  return
                }
                sendJson(500, { error: err?.message || String(err) })
              }
            })
            .catch((err) => {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err?.message || 'Invalid JSON body' }))
            })
          return
        }

        if (req.method !== 'GET') {
          return next()
        }

        if (url === '/local-data/skyport-care-roadmap.json') {
          try {
            const care = resolveSkyportCareWorkbook(cwd, env)
            if (!care) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: 'SkyportCare workbook not found',
                  hint: 'Set LOCAL_SKYPORTCARE_XLSX_FILE or add SkyportCare_Roadmap.xlsx in the project root',
                }),
              )
              return
            }
            sendWorkbookJson(res, care.absPath, care.fileName)
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err?.message || String(err) }))
          }
          return
        }

        if (url === '/local-data/digital-platforms-business-model.json') {
          try {
            const bm = resolveDigitalPlatformsWorkbook(cwd, env)
            if (!bm) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: 'Digital Platforms workbook not found',
                  hint: 'Set LOCAL_DIGITAL_PLATFORMS_XLSX_FILE or add Digital_Platforms_Business_Model.xlsx in the project root',
                }),
              )
              return
            }
            const buf = fs.readFileSync(bm.absPath)
            const wb = XLSX.read(buf, { type: 'buffer' })
            const grids = {}
            for (const name of wb.SheetNames) {
              const sh = wb.Sheets[name]
              grids[name] = XLSX.utils.sheet_to_json(sh, { header: 1, defval: '', raw: false })
            }
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
            res.end(
              JSON.stringify({
                workbook: bm.fileName,
                sheetNames: wb.SheetNames,
                grids,
              }),
            )
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err?.message || String(err) }))
          }
          return
        }

        if (url === '/local-data/support-gantt-test-sheet.json') {
          try {
            const gantt = resolveSupportGanttTestWorkbook(cwd, env)
            if (!gantt) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: 'Support Gantt test workbook not found',
                  hint:
                    'Add Test.xlsx (or Test.xls) under OneDrive …/Skyport-Web-Shared-Test/ (not the project root).',
                  expected: ['(OneDrive)/Skyport-Web-Shared-Test/Test.xlsx', '(OneDrive)/Skyport-Web-Shared-Test/Test.xls'],
                }),
              )
              return
            }
            sendWorkbookJson(res, gantt.absPath, gantt.fileName)
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err?.message || String(err) }))
          }
          return
        }

        if (url === '/local-data/digital-framework.json') {
          try {
            const df = resolveDigitalFrameworkWorkbook(cwd, env)
            if (!df) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: 'Digital Framework workbook not found',
                  hint: 'Add Digital_Framework.xlsx under OneDrive …/Skyport-Web-Shared-Test/.',
                  expected: ['(OneDrive)/Skyport-Web-Shared-Test/Digital_Framework.xlsx'],
                }),
              )
              return
            }
            sendWorkbookJson(res, df.absPath, df.fileName)
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err?.message || String(err) }))
          }
          return
        }

        if (!url.startsWith('/local-data/test-sheet.json')) {
          return next()
        }
        try {
          const home = resolveSkyportHomeWorkbook(cwd, env)
          if (!home) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: 'Home roadmap workbook not found',
                expected: [
                  env.LOCAL_XLSX_FILE || 'SkyportHome_Roadmap.xlsx',
                  'Test.xls',
                  'Test.xlsx',
                ],
              }),
            )
            return
          }
          sendWorkbookJson(res, home.absPath, home.fileName)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err?.message || String(err) }))
        }
      })
    },
  }
}
