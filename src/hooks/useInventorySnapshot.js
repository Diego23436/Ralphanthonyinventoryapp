import { useEffect, useState, useCallback } from 'react'
import { fetchInventorySnapshot, subscribeToInventory } from '../lib/inventoryApi'

export default function useInventorySnapshot() {
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await fetchInventorySnapshot()
      setSnapshot(next)
    } catch (nextError) {
      setError(nextError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const channelName = `inventory-live-${crypto.randomUUID()}`

    async function load() {
      try {
        setError(null)
        const next = await fetchInventorySnapshot()
        if (active) setSnapshot(next)
      } catch (nextError) {
        if (active) setError(nextError)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    const unsubscribe = subscribeToInventory(() => {
      load()
    }, channelName)

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { snapshot, loading, error, refresh }
}
