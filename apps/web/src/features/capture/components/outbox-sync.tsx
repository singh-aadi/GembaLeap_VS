import { useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useEffect } from 'react'
import { eventKeys } from '@/features/events/queries'
import { outbox, retryDelayMs } from '@/lib/outbox'
import { createEventDraft } from '../api'
import { toDraftInput } from '../send-draft'

/** Replays queued captures whenever the device is online. Renders nothing. */
export function OutboxSync() {
  const queryClient = useQueryClient()
  const send = useServerFn(createEventDraft)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let running = false

    async function flush() {
      if (running || !navigator.onLine) return
      running = true
      try {
        for (const item of await outbox.list()) {
          try {
            await send({ data: toDraftInput(item) })
            await outbox.remove(item.id)
            await queryClient.invalidateQueries({ queryKey: eventKeys.all })
          } catch {
            await outbox.update({ ...item, attempts: item.attempts + 1 })
            timer = setTimeout(flush, retryDelayMs(item.attempts))
            return
          }
        }
      } finally {
        running = false
      }
    }

    void flush()
    window.addEventListener('online', flush)
    const unsubscribe = outbox.subscribe(() => void flush())
    return () => {
      window.removeEventListener('online', flush)
      unsubscribe()
      clearTimeout(timer)
    }
  }, [queryClient, send])

  return null
}
