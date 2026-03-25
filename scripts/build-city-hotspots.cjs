/**
 * Build public/data/city-hotspots.json — geocoded city rows for map markers.
 * Matches Locations per City.csv to US/CA cities in country-state-city (lat/lng).
 * When a name matches multiple places, the row count is split across markers.
 */
/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const { City } = require('country-state-city')

const ROOT = path.join(__dirname, '..')
const CSV = path.join(ROOT, 'public/data/locations-per-city.csv')
const OUT = path.join(ROOT, 'public/data/city-hotspots.json')

function normCity(s) {
  return String(s)
    .trim()
    .replace(/^"|"$/g, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
}

function parseLine(line) {
  const t = line.trim()
  if (!t || /^"city"/i.test(t) || t.toLowerCase() === 'city') return null
  const i = t.lastIndexOf(',')
  if (i <= 0) return null
  let city = t.slice(0, i).replace(/^"|"$/g, '').trim()
  city = city.replace(/,$/, '').trim()
  const count = parseInt(t.slice(i + 1), 10)
  if (!city || Number.isNaN(count) || count < 0) return null
  return { city, count }
}

function main() {
  if (!fs.existsSync(CSV)) {
    console.error('Missing', CSV)
    process.exit(1)
  }

  const usCities = City.getCitiesOfCountry('US')
  const caCities = City.getCitiesOfCountry('CA')

  /** @type {Map<string, { name: string, lat: number, lng: number, cc: string, sc: string }[]>} */
  const keyToLocs = new Map()

  function addLocs(list, cc) {
    for (const c of list) {
      const key = normCity(c.name)
      if (!key) continue
      const lat = parseFloat(c.latitude)
      const lng = parseFloat(c.longitude)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
      if (!keyToLocs.has(key)) keyToLocs.set(key, [])
      keyToLocs.get(key).push({
        name: c.name,
        lat,
        lng,
        cc,
        sc: c.stateCode || '',
      })
    }
  }

  addLocs(usCities, 'US')
  addLocs(caCities, 'CA')

  const raw = []
  let skippedRows = 0

  const text = fs.readFileSync(CSV, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const row = parseLine(line)
    if (!row) continue
    const key = normCity(row.city)
    const locs = keyToLocs.get(key)
    if (!locs || locs.length === 0) {
      skippedRows++
      continue
    }
    const displayCity = row.city.trim()
    if (locs.length === 1) {
      const loc = locs[0]
      raw.push({
        city: displayCity,
        count: row.count,
        lat: loc.lat,
        lng: loc.lng,
        cc: loc.cc,
        sc: loc.sc,
      })
    } else {
      const base = Math.floor(row.count / locs.length)
      const rem = row.count - base * locs.length
      locs.forEach((loc, idx) => {
        const c = base + (idx < rem ? 1 : 0)
        if (c < 1) return
        raw.push({
          city: displayCity,
          count: c,
          lat: loc.lat,
          lng: loc.lng,
          cc: loc.cc,
          sc: loc.sc,
        })
      })
    }
  }

  /** Merge same coordinates (split duplicates) */
  const mergeMap = new Map()
  for (const p of raw) {
    const k = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`
    const prev = mergeMap.get(k)
    if (prev) {
      prev.count += p.count
      if (prev.city !== p.city && !prev.city.includes(p.city)) {
        prev.city = `${prev.city} · ${p.city}`
      }
    } else {
      mergeMap.set(k, { ...p })
    }
  }

  const points = [...mergeMap.values()].sort((a, b) => b.count - a.count)
  const counts = points.map((p) => p.count)
  const maxCount = counts.length ? Math.max(...counts) : 0
  const minNonZero = counts.length ? Math.min(...counts) : 0

  const out = {
    points,
    maxCount,
    minNonZero,
    stats: {
      markers: points.length,
      skippedCsvRows: skippedRows,
    },
  }

  fs.writeFileSync(OUT, JSON.stringify(out))
  console.log('Wrote', OUT)
  console.log('Markers:', points.length, 'skipped city rows:', skippedRows, 'max count:', maxCount)
}

main()
