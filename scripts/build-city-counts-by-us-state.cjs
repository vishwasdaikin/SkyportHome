/**
 * Build public/data/city-counts-by-us-state.json from locations-per-city.csv
 * by matching city names to US states using country-state-city (build-time only).
 */
/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const { City, State } = require('country-state-city')

const ROOT = path.join(__dirname, '..')
const CSV = path.join(ROOT, 'public/data/locations-per-city.csv')
const OUT = path.join(ROOT, 'public/data/city-counts-by-us-state.json')

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

  /** @type {Map<string, Set<string>>} */
  const cityToStates = new Map()
  const usStates = State.getStatesOfCountry('US')

  for (const st of usStates) {
    const code = st.isoCode
    const cities = City.getCitiesOfState('US', code)
    for (const c of cities) {
      const key = normCity(c.name)
      if (!key) continue
      if (!cityToStates.has(key)) cityToStates.set(key, new Set())
      cityToStates.get(key).add(code)
    }
  }

  /** @type {Record<string, Map<string, number>>} */
  const byState = {}
  for (const st of usStates) {
    byState[st.isoCode] = new Map()
  }

  const text = fs.readFileSync(CSV, 'utf8')
  let unmatchedRows = 0
  let ambiguousRows = 0

  for (const line of text.split(/\r?\n/)) {
    const row = parseLine(line)
    if (!row) continue
    const key = normCity(row.city)
    const states = cityToStates.get(key)
    if (!states || states.size === 0) {
      unmatchedRows++
      continue
    }
    const displayCity = row.city.trim()
    if (states.size === 1) {
      const abb = [...states][0]
      const m = byState[abb]
      m.set(displayCity, (m.get(displayCity) || 0) + row.count)
    } else {
      ambiguousRows++
      const share = row.count / states.size
      for (const abb of states) {
        const m = byState[abb]
        m.set(displayCity, (m.get(displayCity) || 0) + share)
      }
    }
  }

  const out = {}
  for (const [abb, map] of Object.entries(byState)) {
    const arr = [...map.entries()]
      .map(([city, count]) => ({ city, count: Math.round(count) }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count)
    if (arr.length) out[abb] = arr
  }

  fs.writeFileSync(OUT, JSON.stringify(out))
  console.log('Wrote', OUT)
  console.log('States with data:', Object.keys(out).length)
  console.log('Unmatched city rows (non-US / typos):', unmatchedRows)
  console.log('Ambiguous name rows (split across states):', ambiguousRows)
}

main()
