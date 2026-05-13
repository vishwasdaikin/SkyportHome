const STORAGE_KEY = 'skyportcare-support-desk:v1'

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

export function loadDeskState() {
  if (typeof localStorage === 'undefined') {
    return { tickets: [], docs: [], seq: 0 }
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { tickets: [], docs: [], seq: 0 }
  const data = safeParse(raw, { tickets: [], docs: [], seq: 0 })
  return {
    tickets: Array.isArray(data.tickets) ? data.tickets : [],
    docs: Array.isArray(data.docs) ? data.docs : [],
    seq: typeof data.seq === 'number' ? data.seq : 0,
  }
}

export function saveDeskState(state) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      tickets: state.tickets,
      docs: state.docs,
      seq: state.seq,
    }),
  )
}
