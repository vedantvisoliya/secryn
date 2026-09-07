import { useCallback, useEffect, useRef, useState } from 'react'

import { keysApi } from '@/lib/api'

const PAGE_SIZE = 100

/**
 * The vault's key collection.
 *
 * Mutations patch the local list rather than refetching, so the table doesn't
 * flash on every rename or delete. `reload` is there for when that isn't
 * enough.
 */
export function useApiKeys() {
  const [keys, setKeys] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const page = await keysApi.list({ skip: 0, limit: PAGE_SIZE })
      if (!mounted.current) return
      const rows = Array.isArray(page) ? page : []
      setKeys(rows)
      setHasMore(rows.length === PAGE_SIZE)
      setStatus('ready')
    } catch (caught) {
      if (!mounted.current) return
      setError(caught?.message ?? 'Could not load your keys.')
      setStatus('error')
    }
  }, [])

  // Fetching the collection on mount is exactly the external-system sync an
  // effect is for; `load` flips status to 'loading' inside it.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    try {
      const page = await keysApi.list({ skip: keys.length, limit: PAGE_SIZE })
      if (!mounted.current) return
      const rows = Array.isArray(page) ? page : []
      setKeys((current) => [...current, ...rows])
      setHasMore(rows.length === PAGE_SIZE)
    } catch (caught) {
      if (mounted.current) setError(caught?.message ?? 'Could not load more keys.')
    } finally {
      if (mounted.current) setLoadingMore(false)
    }
  }, [keys.length])

  const upsert = useCallback((record) => {
    setKeys((current) => {
      const index = current.findIndex((item) => item.id === record.id)
      if (index === -1) return [record, ...current]
      const next = [...current]
      next[index] = { ...next[index], ...record }
      return next
    })
  }, [])

  const create = useCallback(
    async (payload) => {
      const created = await keysApi.create(payload)
      if (created?.id) upsert(created)
      else await load()
      return created
    },
    [upsert, load],
  )

  const update = useCallback(
    async (id, patch) => {
      const updated = await keysApi.update(id, patch)
      if (updated?.id) upsert(updated)
      return updated
    },
    [upsert],
  )

  const remove = useCallback(
    async (id) => {
      const deleted = await keysApi.remove(id)
      // The API returns the soft-deleted record; fall back to a local flag if
      // it ever returns something else.
      upsert(deleted?.id ? deleted : { id, is_deleted: true })
      return deleted
    },
    [upsert],
  )

  const restore = useCallback(
    async (id) => {
      const restored = await keysApi.restore(id)
      upsert(restored?.id ? restored : { id, is_deleted: false })
      return restored
    },
    [upsert],
  )

  return {
    keys,
    status,
    error,
    hasMore,
    loadingMore,
    reload: load,
    loadMore,
    create,
    update,
    remove,
    restore,
  }
}
