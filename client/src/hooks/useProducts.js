import { useCallback, useEffect, useRef, useState } from 'react'
import { listProducts, getCounts } from '../api/products'

/** Fetches a page of products whenever `params` change. Stale responses are aborted. */
export function useProducts(params) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const key = JSON.stringify(params)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    listProducts(JSON.parse(key), ctrl.signal)
      .then((d) => {
        setData(d)
        setError(null)
        setLoading(false)
      })
      .catch((e) => {
        if (e.name === 'AbortError') return
        setError(e.message)
        setLoading(false)
      })
    return () => ctrl.abort()
  }, [key, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...data, loading, error, reload }
}

export function useCounts() {
  const [counts, setCounts] = useState(null)
  const alive = useRef(true)
  const reload = useCallback(() => {
    getCounts().then((c) => alive.current && setCounts(c)).catch(() => {})
  }, [])
  useEffect(() => {
    alive.current = true
    reload()
    return () => {
      alive.current = false
    }
  }, [reload])
  return { counts, reloadCounts: reload }
}
