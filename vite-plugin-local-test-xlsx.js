/**
 * Dev-only: serves JSON from ./Test.xlsx on every GET so Excel saves are reflected
 * without rebuilding. Path: GET /local-data/test-sheet.json
 */
import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'

export default function localTestXlsxPlugin() {
  return {
    name: 'local-test-xlsx',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' || !req.url?.startsWith('/local-data/test-sheet.json')) {
          return next()
        }
        try {
          const filePath = path.resolve(process.cwd(), 'Test.xlsx')
          if (!fs.existsSync(filePath)) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Test.xlsx not found in project root', path: filePath }))
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
              /** @deprecated use sheets[name] — kept for older callers */
              sheetName: firstName,
              rows: firstName ? sheets[firstName] : [],
            }),
          )
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err?.message || String(err) }))
        }
      })
    },
  }
}
