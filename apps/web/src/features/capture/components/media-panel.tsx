import { Camera, Mic, Square, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import type { useVoiceRecorder } from '../hooks/use-voice-recorder'

export type Photo = { file: File; url: string }

export function MediaPanel({
  photos,
  onPhotosChange,
  voice,
}: {
  photos: Photo[]
  onPhotosChange: (photos: Photo[]) => void
  voice: ReturnType<typeof useVoiceRecorder>
}) {
  const t = useT()
  const input = useRef<HTMLInputElement>(null)
  const savedRecording = voice.result

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted">{t('capture.evidence')}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button className="h-14" onClick={() => input.current?.click()}>
          <Camera aria-hidden />
          {t('capture.photo')}
        </Button>
        {voice.recording ? (
          <Button variant="danger" className="h-14" onClick={voice.stop}>
            <Square aria-hidden />
            {t('capture.stop', { seconds: voice.elapsed })}
          </Button>
        ) : (
          <Button
            className="h-14"
            onClick={() => void voice.start()}
            disabled={Boolean(savedRecording)}
          >
            <Mic aria-hidden />
            {t('capture.voice')}
          </Button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).map((file) => ({
            file,
            url: URL.createObjectURL(file),
          }))
          onPhotosChange([...photos, ...files].slice(0, 4))
          e.target.value = ''
        }}
      />
      {photos.length > 0 || savedRecording ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <li key={photo.url} className="relative">
              <img
                src={photo.url}
                alt={t('capture.photoAlt', { n: index + 1 })}
                className="size-20 rounded-lg border border-line object-cover"
              />
              <button
                type="button"
                onClick={() => onPhotosChange(photos.filter((p) => p !== photo))}
                className="absolute -top-2 -right-2 inline-flex size-7 items-center justify-center rounded-full border border-line bg-surface text-muted"
              >
                <Trash2 className="size-3.5" aria-hidden />
                <span className="sr-only">{t('common.remove')}</span>
              </button>
            </li>
          ))}
          {savedRecording ? (
            <li className="flex h-20 items-center gap-2 rounded-lg border border-line bg-surface px-3">
              <Mic className="size-4 text-muted" aria-hidden />
              <audio src={savedRecording.url} controls className="h-9 w-44" />
              <button
                type="button"
                onClick={voice.clear}
                className="inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-subtle"
              >
                <Trash2 className="size-4" aria-hidden />
                <span className="sr-only">{t('common.remove')}</span>
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  )
}
