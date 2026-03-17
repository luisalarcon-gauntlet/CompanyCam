import { WifiOff, Check, Loader2 } from 'lucide-react'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { useOfflineStore } from '../../stores/offlineStore'
import { useCallback, useEffect, useState } from 'react'

export function OfflineBanner() {
  const isOnline = useNetworkStatus()
  const { pendingCount, flushQueue, refreshPendingCount } = useOfflineStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [justSynced, setJustSynced] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    refreshPendingCount()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const doSync = useCallback(async () => {
    if (!isOnline || isSyncing) return
    setIsSyncing(true)
    try {
      const count = await flushQueue()
      if (count > 0) {
        setJustSynced(true)
        setTimeout(() => setJustSynced(false), 2500)
      }
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, flushQueue])

  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      doSync()
    }
  }, [isOnline]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOnline || isSyncing || justSynced) {
      setShowBanner(true)
    } else {
      const timer = setTimeout(() => setShowBanner(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isOnline, isSyncing, justSynced])

  if (!showBanner) return null

  if (justSynced) {
    return (
      <div className="bg-green-600 text-white text-sm font-medium flex items-center justify-center gap-2 py-2 px-4 animate-fade-in">
        <Check size={14} />
        Changes synced successfully
      </div>
    )
  }

  if (isSyncing) {
    return (
      <div className="bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 py-2 px-4 animate-fade-in">
        <Loader2 size={14} className="animate-spin" />
        Syncing {pendingCount} change{pendingCount !== 1 ? 's' : ''}...
      </div>
    )
  }

  if (!isOnline) {
    return (
      <div className="bg-amber-600 text-white text-sm font-medium flex items-center justify-center gap-2 py-2 px-4 animate-fade-in">
        <WifiOff size={14} />
        You're offline — changes will sync when connected
      </div>
    )
  }

  return null
}
