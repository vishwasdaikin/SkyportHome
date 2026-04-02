/**
 * Dev-only: serves JSON from a local workbook on every GET so Excel saves are
 * reflected without rebuilding. Path: GET /local-data/test-sheet.json
 *
 * Workbook selection order:
 * 1) env `LOCAL_XLSX_FILE`
 * 2) ./SkyportHome_Roadmap.xlsx
 * 3) ./Test.xlsx
 */
import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

function resolveWorkbookPath() {
  const envName = process.env.LOCAL_XLSX_FILE?.trim()
  const candidates = [
    envName || null,
    'SkyportHome_Roadmap.xlsx',
    'Test.xlsx',
  ].filter(Boolean)

  for (const rel of candidates) {
    const abs = path.resolve(process.cwd(), rel)
    if (fs.existsSync(abs)) {
      return { absPath: abs, fileName: rel }
    }
  }

  return {
    absPath: path.resolve(process.cwd(), 'SkyportHome_Roadmap.xlsx'),
    fileName: envName || 'SkyportHome_Roadmap.xlsx',
  }
}

function sendWorkbookJson(res, filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: 'Workbook not found in project root',
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

export default function localTestXlsxPlugin() {
  return {
    name: 'local-test-xlsx',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET') {
          return next()
        }
        const url = req.url?.split('?')[0] ?? ''

        if (url === '/local-data/skyport-care-roadmap.json') {
          try {
            const fileName = 'SkyportCare_Roadmap.xlsx'
            const filePath = path.resolve(process.cwd(), fileName)
            sendWorkbookJson(res, filePath, fileName)
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
          const { absPath: filePath, fileName } = resolveWorkbookPath()
          if (!fs.existsSync(filePath)) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: 'Workbook not found in project root',
                expected: [
                  process.env.LOCAL_XLSX_FILE || 'SkyportHome_Roadmap.xlsx',
                  'Test.xlsx',
                ],
                path: filePath,
              }),
            )
            return
          }
          sendWorkbookJson(res, filePath, fileName)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err?.message || String(err) }))
        }
      })
    },
  }
}
