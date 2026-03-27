#!/usr/bin/env node
/**
 * Headless Chrome PDF — Recharts renders as normal SVG/DOM, so output matches on-screen charts
 * more reliably than browser "Print" for complex layouts.
 *
 * 1) Build and serve:  npm run build && npm run preview
 * 2) Run:              npm run pdf:fy26
 *
 * Env (optional):
 *   PDF_URL              — full URL (default http://127.0.0.1:4173/strategy/fy26/digital-platform)
 *   PDF_OUTPUT           — output file (default fy26-digital-platform.pdf in cwd)
 *   PUPPETEER_EXECUTABLE_PATH — Chrome/Chromium binary (auto-detected on macOS if unset)
 *
 * If the site uses VITE_SITE_PASSWORD, sessionStorage is primed so the gate does not block.
 */
import fs from 'fs'
import puppeteer from 'puppeteer-core'

const STORAGE_KEY = 'skyport_site_unlocked'

function defaultChromeExecutable() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH
  }
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
  if (process.platform === 'linux') {
    const candidates = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ]
    for (const p of candidates) {
      if (fs.existsSync(p)) return p
    }
  }
  if (process.platform === 'win32') {
    const win = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    if (fs.existsSync(win)) return win
  }
  return null
}

const url =
  process.env.PDF_URL?.trim() ||
  'http://127.0.0.1:4173/strategy/fy26/digital-platform'
const output =
  process.env.PDF_OUTPUT?.trim() || 'fy26-digital-platform.pdf'

async function main() {
  const executablePath = defaultChromeExecutable()
  if (!executablePath || !fs.existsSync(executablePath)) {
    console.error(
      'Could not find Chrome. Set PUPPETEER_EXECUTABLE_PATH to your Chrome/Chromium binary,\n' +
        'or install Google Chrome. On macOS the default is /Applications/Google Chrome.app/...',
    )
    process.exit(1)
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.evaluateOnNewDocument((key) => {
      try {
        sessionStorage.setItem(key, '1')
      } catch {
        /* ignore */
      }
    }, STORAGE_KEY)

    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    })

    await page
      .waitForSelector('.recharts-surface', { timeout: 45_000 })
      .catch(() => {
        console.warn(
          'No .recharts-surface found within timeout — PDF may omit charts or be incomplete.',
        )
      })

    await page.emulateMediaType('print')

    await page.pdf({
      path: output,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    })

    console.log(`Wrote ${output}`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
