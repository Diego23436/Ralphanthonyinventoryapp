const STORAGE_KEY = 'ra_offline_queue'

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeQueue(queue) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
}

export function getOfflineQueue() {
  return readQueue()
}

export function enqueueOfflineMutation(mutation) {
  const queue = readQueue()
  const next = [
    ...queue,
    {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...mutation,
    },
  ]
  writeQueue(next)
  return next[next.length - 1]
}

export function removeQueuedMutation(id) {
  const queue = readQueue().filter((mutation) => mutation.id !== id)
  writeQueue(queue)
  return queue
}

export async function flushOfflineQueue(handlers) {
  const queue = readQueue()
  if (queue.length === 0) return { synced: 0, errors: [] }

  const errors = []
  let synced = 0

  for (const mutation of queue) {
    const handler = handlers[mutation.type]
    if (!handler) {
      errors.push({ mutation, error: new Error(`No handler for ${mutation.type}`) })
      continue
    }

    try {
      await handler(mutation.payload)
      synced += 1
      removeQueuedMutation(mutation.id)
    } catch (error) {
      errors.push({ mutation, error })
    }
  }

  return { synced, errors }
}

