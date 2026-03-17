import { useState, useEffect, useCallback } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export function useOfflineSync(syncFn) {
  const isOnline = useNetworkStatus()
  const [isSyncing, setIsSyncing] = useState(false)
  const [justSynced, setJustSynced] = useState(false)

  const doSync = useCallback(async () => {
    if (!isOnline || isSyncing) return
    setIsSyncing(true)
    try {
      const count = await syncFn()
      if (count > 0) {
        setJustSynced(true)
        setTimeout(() => setJustSynced(false), 2000)
      }
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, syncFn])

  useEffect(() => {
    if (isOnline) {
      doSync()
    }
  }, [isOnline]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isOnline, isSyncing, justSynced, doSync }
}
