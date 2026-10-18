import type { CreateEventDraftInput } from '@gembaleap/schemas'
import type { OutboxItem } from '@/lib/outbox'

const EXT = { photo: 'jpg', audio: 'webm' } as const

/**
 * Turns a queued capture into the server request. Media upload to Cloud Storage
 * via a signed URL slots in here (M1); until then only the device-side hash and
 * a pending path are sent.
 */
export function toDraftInput(item: Pick<OutboxItem, 'draft' | 'media'>): CreateEventDraftInput {
  return {
    ...item.draft,
    media: item.media.map((m) => ({
      kind: m.kind,
      sha256: m.sha256,
      storagePath: `uploads/pending/${m.sha256}.${EXT[m.kind]}`,
    })),
  }
}
