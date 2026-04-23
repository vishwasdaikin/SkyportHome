/**
 * Map each screenshot to the most recent "Step N" in the same Word section.
 * Run: DOCX="/path/to/SkyportCare Dealer Help Guide.docx" node scripts/map-skyportcare-step-images.mjs
 */
import { execSync } from 'child_process'
import { JSDOM } from 'jsdom'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
const A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main'

const defaultDocx =
  '/Users/vishwas/Library/CloudStorage/OneDrive-GoodmanManufacturing/Controls & Solutions/SkyPort/SkyportCare/SkyportCare Dealer Support/SkyportCare Dealer Help Guide.docx'
const docxPath = process.env.DOCX || defaultDocx

const xml = execSync(`unzip -p "${docxPath}" word/document.xml`, {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
})
const relsXml = execSync(`unzip -p "${docxPath}" word/_rels/document.xml.rels`, { encoding: 'utf8' })

const idToMedia = {}
relsXml.replace(/Id="(rId\d+)"[^>]*Target="media\/([^"]+)"/g, (_, id, m) => {
  idToMedia[id] = m
  return ''
})

const dom = new JSDOM(xml, { contentType: 'text/xml' })
const doc = dom.window.document
const body = doc.getElementsByTagNameNS(W_NS, 'body')[0]

function paragraphText(p) {
  const ts = p.getElementsByTagNameNS(W_NS, 't')
  return Array.from(ts)
    .map((t) => t.textContent || '')
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function paragraphEmbeds(p) {
  const out = []
  const blips = p.getElementsByTagNameNS(A_NS, 'blip')
  for (let i = 0; i < blips.length; i++) {
    const b = blips[i]
    const embed = b.getAttribute('r:embed') || b.getAttribute('embed')
    if (!embed) continue
    const media = idToMedia[embed]
    if (media) out.push(media)
  }
  return out
}

const SECTION_MARKERS = [
  'SSO Account Set-up Process',
  'SSO Account Activation Process',
  'Team Member Invitation Process',
  'Homeowner Invitation Process',
  'License Purchase/Renewal Process: SkyportCare & Warranty Express',
  'Warranty Express License Purchase Process',
  'Frequently Asked Questions',
]

const ARTICLE_KEYS = {
  'SSO Account Set-up Process': 'sso-account-setup',
  'SSO Account Activation Process': 'sso-account-activation',
  'Team Member Invitation Process': 'team-member-invite',
  'Homeowner Invitation Process': 'homeowner-invitation',
  'License Purchase/Renewal Process: SkyportCare & Warranty Express': 'license-purchase-renewal',
  'Warranty Express License Purchase Process': 'warranty-express-license-purchase',
}

/** step number (1-based) -> filename[] */
const sectionStepImages = new Map()
let currentSection = null
let currentStep = 1

function ensureSection() {
  if (!currentSection) return
  if (!sectionStepImages.has(currentSection)) sectionStepImages.set(currentSection, new Map())
}

function addImagesToStep(files) {
  if (!currentSection || !files.length) return
  ensureSection()
  const m = sectionStepImages.get(currentSection)
  if (!m.has(currentStep)) m.set(currentStep, [])
  m.get(currentStep).push(...files)
}

const paras = Array.from(doc.getElementsByTagNameNS(W_NS, 'p'))

for (const p of paras) {
  const text = paragraphText(p)
  for (const marker of SECTION_MARKERS) {
    if (text.includes(marker)) {
      currentSection = marker
      currentStep = 1
      break
    }
  }

  const stepMatch = text.match(/\bStep\s*(\d+)/i)
  if (stepMatch) {
    currentStep = parseInt(stepMatch[1], 10)
    if (!Number.isFinite(currentStep) || currentStep < 1) currentStep = 1
  }

  const embeds = paragraphEmbeds(p)
  if (embeds.length) {
    addImagesToStep(embeds)
  }
}

/** Convert to articleId -> { stepIndex0: [files] } (step index 0 = Step 1 in UI) */
const byArticleId = {}
for (const [section, stepMap] of sectionStepImages) {
  const aid = ARTICLE_KEYS[section]
  if (!aid) continue
  const out = {}
  for (const [stepNum, files] of stepMap) {
    const idx = stepNum - 1
    if (!out[idx]) out[idx] = []
    out[idx].push(...files)
  }
  byArticleId[aid] = out
}

const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'skyportCareDealerSupportStepImages.json')
writeFileSync(outPath, JSON.stringify({ byArticleId, rawSectionSteps: Object.fromEntries(sectionStepImages) }, null, 2))
console.log(JSON.stringify(byArticleId, null, 2))
console.error('Wrote', outPath)
