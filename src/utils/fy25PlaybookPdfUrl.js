/** Strategic Marketing FY25 Playbook PDF — same URL logic everywhere (direct file or Office viewer on HTTPS). */
const FY25_PDF = 'downloads/FY25-Strategic-Marketing-Playbook.pdf'

export function getFy25PlaybookPdfUrl() {
  const base = import.meta.env.BASE_URL || '/'
  if (typeof window === 'undefined') {
    const root = base.endsWith('/') ? base : `${base}/`
    return `${root}${FY25_PDF}`
  }
  const fileUrl = new URL(FY25_PDF, window.location.origin + base).href
  const isLocal =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (isLocal || window.location.protocol !== 'https:') return fileUrl
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`
}
