/**
 * One-off: map SkyportCare Dealer Help Guide.docx images to section titles by
 * walking w:p order (text + drawings). Run with:
 * DOCX="/path/to/SkyportCare Dealer Help Guide.docx" node scripts/map-skyportcare-help-images.mjs
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

const SECTION_MARKERS = [
  'SSO Account Set-up Process',
  'SSO Account Activation Process',
  'Team Member Invitation Process',
  'Homeowner Invitation Process',
  'License Purchase/Renewal Process: SkyportCare & Warranty Express',
  'Warranty Express License Purchase Process',
  'Frequently Asked Questions',
]

let currentSection = 'Front matter'
const sectionImages = new Map()
function addImage(fn) {
  if (!sectionImages.has(currentSection)) sectionImages.set(currentSection, [])
  sectionImages.get(currentSection).push(fn)
}

/** Document-order walk: picks up drawings in tables and text boxes, not only top-level w:p. */
const NF = dom.window.NodeFilter
const walker = doc.createTreeWalker(body, NF.SHOW_ELEMENT)
let node = walker.nextNode()
while (node) {
  if (node.namespaceURI === W_NS && node.localName === 'p') {
    const text = paragraphText(node)
    for (const m of SECTION_MARKERS) {
      if (text.includes(m)) {
        currentSection = m
        break
      }
    }
  }
  if (node.namespaceURI === A_NS && node.localName === 'blip') {
    const embed = node.getAttribute('r:embed') || node.getAttribute('embed')
    if (embed) {
      const media = idToMedia[embed]
      if (media) addImage(media)
    }
  }
  node = walker.nextNode()
}


const ordered = []
sectionImages.forEach((files, title) => {
  ordered.push({ section: title, files })
})

const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'skyportCareDealerSupportGuideMedia.json')
writeFileSync(outPath, JSON.stringify({ sectionImages: Object.fromEntries(sectionImages), ordered }, null, 2))
console.log(JSON.stringify(ordered, null, 2))
console.error('Wrote', outPath)
