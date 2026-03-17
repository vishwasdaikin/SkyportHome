import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'featureProgress'

function load(scope) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${scope}`)
    if (!raw) return null
    const data = JSON.parse(raw)
    return {
      done: Array.isArray(data.done) ? data.done : [],
      partial: Array.isArray(data.partial) ? data.partial : [],
    }
  } catch {
    return null
  }
}

function save(scope, { done, partial }) {
  try {
    localStorage.setItem(
      `${STORAGE_KEY}_${scope}`,
      JSON.stringify({ done: [...done], partial: [...partial] })
    )
  } catch (_) {}
}

/**
 * @param {'skyportHome' | 'skyportCare'} scope
 * @param {{ initialDone?: string[], initialPartial?: string[] }} options
 */
export function useFeatureProgress(scope, { initialDone = [], initialPartial = [] } = {}) {
  const [state, setState] = useState(() => {
    const stored = load(scope)
    if (stored) {
      return {
        done: new Set(stored.done),
        partial: new Set(stored.partial),
      }
    }
    return {
      done: new Set(initialDone),
      partial: new Set(initialPartial),
    }
  })

  useEffect(() => {
    save(scope, {
      done: [...state.done],
      partial: [...state.partial],
    })
  }, [scope, state.done, state.partial])

  const setProgress = useCallback((feature, status) => {
    if (!feature) return
    setState((prev) => {
      const nextDone = new Set(prev.done)
      const nextPartial = new Set(prev.partial)
      nextDone.delete(feature)
      nextPartial.delete(feature)
      if (status === 'done') nextDone.add(feature)
      if (status === 'partial') nextPartial.add(feature)
      return { done: nextDone, partial: nextPartial }
    })
  }, [])

  const getStatus = useCallback(
    (feature) => {
      if (state.done.has(feature)) return 'done'
      if (state.partial.has(feature)) return 'partial'
      return null
    },
    [state.done, state.partial]
  )

  return { doneSet: state.done, partialSet: state.partial, setProgress, getStatus }
}
