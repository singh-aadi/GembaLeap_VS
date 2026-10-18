import type { EventType } from '@gembaleap/schemas'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Clock, Lightbulb, Package, ShieldAlert, CircleX } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmBar } from '@/components/app/confirm-bar'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Label, Textarea } from '@/components/ui/field'
import { digestBlob } from '@/lib/digest'
import { toastError } from '@/lib/errors'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import { newClientId, outbox, type OutboxItem } from '@/lib/outbox'
import { createEventDraft } from '../api'
import { useVoiceRecorder } from '../hooks/use-voice-recorder'
import { captureContextQuery } from '../queries'
import { toDraftInput } from '../send-draft'
import { ChoiceChips } from './choice-chips'
import { MediaPanel, type Photo } from './media-panel'

const TYPE_ICONS = {
  defect: CircleX,
  downtime: Clock,
  material: Package,
  safety: ShieldAlert,
  idea: Lightbulb,
} as const

export function CapturePage() {
  const t = useT()
  const pick = useLocalized()
  const navigate = useNavigate()
  const send = useServerFn(createEventDraft)
  const { data } = useSuspenseQuery(captureContextQuery())
  const voice = useVoiceRecorder(() => toast.error(t('capture.micDenied')))
  const [stageId, setStageId] = useState<string>()
  const [type, setType] = useState<EventType>()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [text, setText] = useState('')
  const [lotNo, setLotNo] = useState('')
  const [sending, setSending] = useState(false)

  const hasContent = photos.length > 0 || voice.result !== null || text.trim().length > 0

  function reset() {
    photos.forEach((p) => URL.revokeObjectURL(p.url))
    setPhotos([])
    voice.clear()
    setText('')
    setLotNo('')
  }

  async function submit() {
    setSending(true)
    const media = await Promise.all([
      ...photos.map(async (p) => ({
        kind: 'photo' as const,
        blob: p.file,
        sha256: await digestBlob(p.file),
      })),
      ...(voice.result
        ? [
            {
              kind: 'audio' as const,
              blob: voice.result.blob,
              sha256: await digestBlob(voice.result.blob),
            },
          ]
        : []),
    ])
    const item: OutboxItem = {
      id: newClientId(),
      createdAt: new Date().toISOString(),
      attempts: 0,
      draft: {
        siteId: data.siteId,
        stageId,
        type,
        locale: data.locale,
        text: text.trim() || undefined,
        lotNo: lotNo.trim() || undefined,
      },
      media,
    }
    try {
      if (!navigator.onLine) {
        await outbox.add(item)
        toast.success(t('capture.savedOffline'))
        reset()
        return
      }
      const { id } = await send({ data: toDraftInput(item) })
      reset()
      await navigate({ to: '/s/events/$eventId', params: { eventId: id } })
    } catch (error) {
      toastError(t, error)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <PageHeader title={t('capture.title')} meta={t('capture.subtitle')} />
      <Card className="space-y-6 p-4">
        <ChoiceChips
          label={t('capture.stage')}
          value={stageId}
          onChange={setStageId}
          choices={data.stages.map((s) => ({ value: s.id, label: pick(s.name) }))}
        />
        <ChoiceChips
          label={t('capture.type')}
          value={type}
          onChange={setType}
          choices={(Object.keys(TYPE_ICONS) as EventType[]).map((value) => ({
            value,
            label: t(`eventType.${value}`),
            icon: TYPE_ICONS[value],
          }))}
        />
        <MediaPanel photos={photos} onPhotosChange={setPhotos} voice={voice} />
        <div>
          <Label htmlFor="capture-text">{t('capture.note')}</Label>
          <Textarea
            id="capture-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('capture.notePlaceholder')}
          />
        </div>
        <div className="sm:max-w-xs">
          <Label htmlFor="capture-lot">{t('capture.lot')}</Label>
          <Input
            id="capture-lot"
            list="open-lots"
            value={lotNo}
            onChange={(e) => setLotNo(e.target.value)}
            className="font-mono"
            autoCapitalize="characters"
          />
          <datalist id="open-lots">
            {data.openLots.map((lot) => (
              <option key={lot.id} value={lot.lotNo}>
                {lot.partNo}
              </option>
            ))}
          </datalist>
        </div>
      </Card>
      <ConfirmBar note={t('capture.offlineNote')}>
        <Button
          variant="primary"
          onClick={() => void submit()}
          disabled={!hasContent || sending || voice.recording}
        >
          {t('capture.send')}
        </Button>
      </ConfirmBar>
    </>
  )
}
