import type { CreateEventDraftInput } from '@gembaleap/schemas'

/**
 * Offline capture queue in IndexedDB. Media stays as Blobs until it can be
 * uploaded; the draft request is replayed in order with backoff.
 */
export type OutboxMedia = { kind: 'photo' | 'audio'; blob: Blob; sha256: string }
export type OutboxItem = {
  id: string
  createdAt: string
  attempts: number
  draft: Omit<CreateEventDraftInput, 'media'>
  media: OutboxMedia[]
}

const DB_NAME = 'gembaleap'
const STORE = 'outbox'
const listeners = new Set<() => void>()

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await open()
  return new Promise((resolve, reject) => {
    const request = action(database.transaction(STORE, mode).objectStore(STORE))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function notify() {
  for (const listener of listeners) listener()
}

export const outbox = {
  async add(item: OutboxItem) {
    await run('readwrite', (s) => s.put(item))
    notify()
  },
  async list(): Promise<OutboxItem[]> {
    const items = await run<OutboxItem[]>('readonly', (s) => s.getAll())
    return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  },
  async update(item: OutboxItem) {
    await run('readwrite', (s) => s.put(item))
  },
  async remove(id: string) {
    await run('readwrite', (s) => s.delete(id))
    notify()
  },
  count: () => run<number>('readonly', (s) => s.count()),
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

/** Exponential backoff with a 5-minute ceiling. */
export function retryDelayMs(attempts: number): number {
  return Math.min(300_000, 2_000 * 2 ** attempts)
}

export function newClientId(): string {
  return crypto.randomUUID()
}
