import { create } from 'zustand'
import {
  addToSyncQueue,
  getSyncQueue,
  markSynced,
  clearSyncedActions,
  getSyncQueueCount,
  cacheProjects,
  cacheProject,
  getCachedProjects,
  getCachedProject,
  updateCachedItem,
} from '../services/offline-db'
import { itemsApi } from '../services/api'

export const useOfflineStore = create((set, get) => ({
  pendingCount: 0,
  pendingItemIds: new Set(),
  syncedItemIds: new Set(),

  refreshPendingCount: async () => {
    const count = await getSyncQueueCount()
    const queue = await getSyncQueue()
    const itemIds = new Set()
    for (const action of queue) {
      if (action.itemId) itemIds.add(action.itemId)
    }
    set({ pendingCount: count, pendingItemIds: itemIds })
  },

  queueAction: async (action) => {
    await addToSyncQueue(action)
    await get().refreshPendingCount()
  },

  flushQueue: async () => {
    const queue = await getSyncQueue()
    if (queue.length === 0) return 0

    let syncedCount = 0

    for (const action of queue) {
      try {
        switch (action.type) {
          case 'COMPLETE_ITEM':
            await itemsApi.complete(action.itemId, { via: action.via })
            break
          case 'UNCOMPLETE_ITEM':
            await itemsApi.uncomplete(action.itemId)
            break
          case 'CREATE_ITEM':
            await itemsApi.create(action.checklistId, { title: action.title })
            break
          case 'DELETE_ITEM':
            await itemsApi.delete(action.itemId)
            break
          default:
            break
        }
        await markSynced(action.id)

        if (action.itemId) {
          set((s) => {
            const next = new Set(s.syncedItemIds)
            next.add(action.itemId)
            return { syncedItemIds: next }
          })
        }

        syncedCount++
      } catch {
        break
      }
    }

    await clearSyncedActions()
    await get().refreshPendingCount()

    setTimeout(() => {
      set({ syncedItemIds: new Set() })
    }, 2000)

    return syncedCount
  },

  cacheProjectData: async (project) => {
    await cacheProject(project)
  },

  cacheProjectsList: async (projects) => {
    await cacheProjects(projects)
  },

  getCachedProjects: async () => {
    return getCachedProjects()
  },

  getCachedProject: async (id) => {
    return getCachedProject(id)
  },

  updateItemLocally: async (item) => {
    await updateCachedItem(item)
  },
}))
