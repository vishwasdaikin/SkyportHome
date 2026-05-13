/**
 * Parse Locations per Country.csv — ISO 3166-1 alpha-2 code + count.
 */

export function parseLocationsPerCountryCsv(text) {
  const rows = []
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || /^"country"/i.test(t) || t.toLowerCase() === '"country","count(address)"') continue
    const lastComma = t.lastIndexOf(',')
    if (lastComma <= 0) continue
    let code = t.slice(0, lastComma).replace(/^"|"$/g, '').trim().toUpperCase()
    code = code.replace(/,$/, '').trim()
    const count = parseInt(t.slice(lastComma + 1), 10)
    if (!code || Number.isNaN(count) || count < 0) continue
    rows.push({ code, count })
  }
  rows.sort((a, b) => b.count - a.count)
  const total = rows.reduce((s, r) => s + r.count, 0)
  return { rows, total }
}
