import { openDB } from 'idb'

const DB_NAME = 'fieldcheck'
const DB_VERSION = 1

const STORES = {
  PROJECTS: 'projects',
  CHECKLISTS: 'checklists',
  ITEMS: 'items',
  SYNC_QUEUE: 'syncQueue',
}

let dbPromise = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
          db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.CHECKLISTS)) {
          const store = db.createObjectStore(STORES.CHECKLISTS, { keyPath: 'id' })
          store.createIndex('projectId', 'project_id')
        }
        if (!db.objectStoreNames.contains(STORES.ITEMS)) {
          const store = db.createObjectStore(STORES.ITEMS, { keyPath: 'id' })
          store.createIndex('checklistId', 'checklist_id')
        }
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const store = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: 'id',
            autoIncrement: true,
          })
          store.createIndex('timestamp', 'timestamp')
        }
      },
    })
  }
  return dbPromise
}

// ─── Projects ───

export async function cacheProjects(projects) {
  const db = await getDb()
  const tx = db.transaction(STORES.PROJECTS, 'readwrite')
  for (const project of projects) {
    await tx.store.put(project)
  }
  await tx.done
}

export async function cacheProject(project) {
  const db = await getDb()
  await db.put(STORES.PROJECTS, project)
}

export async function getCachedProjects() {
  const db = await getDb()
  return db.getAll(STORES.PROJECTS)
}

export async function getCachedProject(id) {
  const db = await getDb()
  return db.get(STORES.PROJECTS, id)
}

export async function deleteCachedProject(id) {
  const db = await getDb()
  await db.delete(STORES.PROJECTS, id)
}

// ─── Checklists ───

export async function cacheChecklists(checklists) {
  const db = await getDb()
  const tx = db.transaction(STORES.CHECKLISTS, 'readwrite')
  for (const cl of checklists) {
    await tx.store.put(cl)
  }
  await tx.done
}

export async function getCachedChecklists(projectId) {
  const db = await getDb()
  return db.getAllFromIndex(STORES.CHECKLISTS, 'projectId', projectId)
}

// ─── Items ───

export async function cacheItems(items) {
  const db = await getDb()
  const tx = db.transaction(STORES.ITEMS, 'readwrite')
  for (const item of items) {
    await tx.store.put(item)
  }
  await tx.done
}

export async function getCachedItems(checklistId) {
  const db = await getDb()
  return db.getAllFromIndex(STORES.ITEMS, 'checklistId', checklistId)
}

export async function updateCachedItem(item) {
  const db = await getDb()
  await db.put(STORES.ITEMS, item)
}

// ─── Sync Queue ───

export async function addToSyncQueue(action) {
  const db = await getDb()
  await db.add(STORES.SYNC_QUEUE, {
    ...action,
    timestamp: Date.now(),
    synced: false,
  })
}

export async function getSyncQueue() {
  const db = await getDb()
  const all = await db.getAll(STORES.SYNC_QUEUE)
  return all.filter((a) => !a.synced).sort((a, b) => a.timestamp - b.timestamp)
}

export async function markSynced(id) {
  const db = await getDb()
  const item = await db.get(STORES.SYNC_QUEUE, id)
  if (item) {
    item.synced = true
    await db.put(STORES.SYNC_QUEUE, item)
  }
}

export async function clearSyncedActions() {
  const db = await getDb()
  const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite')
  const all = await tx.store.getAll()
  for (const action of all) {
    if (action.synced) {
      await tx.store.delete(action.id)
    }
  }
  await tx.done
}

export async function getSyncQueueCount() {
  const queue = await getSyncQueue()
  return queue.length
}

export { STORES }
