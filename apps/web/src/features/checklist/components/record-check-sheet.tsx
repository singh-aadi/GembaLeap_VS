import { evaluateMeasurement } from '@gembaleap/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Camera } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/app/status-badge'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/field'
import { Sheet } from '@/components/ui/sheet'
import { cn } from '@/lib/cn'
import { digestBlob } from '@/lib/digest'
import { toastError } from '@/lib/errors'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import { recordCheck } from '../api'
import { checklistKeys, type ChecklistEntry } from '../queries'
import { RequirementSpec } from './requirement-spec'

type Target = { entry: ChecklistEntry; slot: string }

/** Built-in quality at the station: no evidence, no record; out of limit, no record without containment. */
export function RecordCheckSheet({
  target,
  onClose,
}: {
  target: Target | null
  onClose: () => void
}) {
  const t = useT()
  const pick = useLocalized()
  const queryClient = useQueryClient()
  const record = useServerFn(recordCheck)
  const fileInput = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [text, setText] = useState('')
  const [passed, setPassed] = useState<boolean>()
  const [containment, setContainment] = useState('')
  const [photo, setPhoto] = useState<{ file: File; url: string }>()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!target || !photo) throw new Error('[VALIDATION]')
      const sha256 = await digestBlob(photo.file)
      return record({
        data: {
          itemId: target.entry.item.id,
          slot: target.slot,
          value: value === '' ? undefined : Number(value),
          text: text.trim() || undefined,
          passed,
          containment: containment.trim() || undefined,
          evidence: [
            {
              kind: requirement?.kind === 'scan' ? 'scan' : 'photo',
              sha256,
              storagePath: `uploads/pending/${sha256}.jpg`,
            },
          ],
        },
      })
    },
    onSuccess: (saved) => {
      toast.success(saved.result === 'pass' ? t('check.saved') : t('check.savedOutOfLimit'))
      void queryClient.invalidateQueries({ queryKey: checklistKeys.all })
      close()
    },
    onError: (error) => toastError(t, error),
  })

  function close() {
    if (photo) URL.revokeObjectURL(photo.url)
    setValue('')
    setText('')
    setPassed(undefined)
    setContainment('')
    setPhoto(undefined)
    onClose()
  }

  const requirement = target?.entry.item.requirement
  const numeric = value === '' ? undefined : Number(value)
  const result =
    requirement?.kind === 'measurement' && numeric !== undefined && !Number.isNaN(numeric)
      ? evaluateMeasurement(requirement, numeric)
      : requirement?.kind === 'confirm' && passed !== undefined
        ? passed
          ? 'pass'
          : 'fail'
        : undefined
  const needsContainment = result === 'out_of_limit' || result === 'fail'
  const answered =
    requirement?.kind === 'measurement'
      ? result !== undefined
      : requirement?.kind === 'confirm'
        ? passed !== undefined
        : requirement?.kind === 'scan'
          ? text.trim() !== ''
          : true
  const ready = Boolean(photo) && answered && (!needsContainment || containment.trim().length > 0)

  return (
    <Sheet
      open={target !== null}
      onOpenChange={(open) => !open && close()}
      title={target ? pick(target.entry.item.label) : ''}
      description={target ? `${target.entry.item.standardRef} · ${target.slot}` : undefined}
      closeLabel={t('common.close')}
      footer={
        <Button
          variant="primary"
          className="w-full"
          disabled={!ready || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {t('check.save')}
        </Button>
      }
    >
      {requirement ? (
        <div className="space-y-5">
          <p className="text-xs text-muted">
            <RequirementSpec requirement={requirement} />
          </p>
          {requirement.kind === 'measurement' ? (
            <div>
              <Label htmlFor="check-value">{t('check.reading', { unit: requirement.unit })}</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="check-value"
                  inputMode="decimal"
                  type="number"
                  step="any"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="max-w-40 text-base tabular-nums"
                />
                {result ? (
                  <StatusBadge
                    status={result === 'pass' ? 'pass' : 'fail'}
                    label={t(`check.result.${result}`)}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
          {requirement.kind === 'confirm' ? (
            <div className="grid grid-cols-2 gap-2">
              {[true, false].map((option) => (
                <button
                  key={String(option)}
                  type="button"
                  aria-pressed={passed === option}
                  onClick={() => setPassed(option)}
                  className={cn(
                    'h-14 rounded-lg border text-sm font-medium',
                    passed === option
                      ? option
                        ? 'border-good bg-good-soft text-good'
                        : 'border-bad bg-bad-soft text-bad'
                      : 'border-line bg-surface',
                  )}
                >
                  {t(option ? 'check.ok' : 'check.notOk')}
                </button>
              ))}
            </div>
          ) : null}
          {requirement.kind === 'scan' ? (
            <div>
              <Label htmlFor="check-text">{t(`check.req.scan.${requirement.field}`)}</Label>
              <Input
                id="check-text"
                value={text}
                onChange={(e) => setText(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>
          ) : null}
          <div>
            <p className="mb-2 text-xs font-medium text-muted">{t('check.evidenceRequired')}</p>
            {photo ? (
              <img
                src={photo.url}
                alt={t('check.evidencePhoto')}
                className="aspect-[4/3] w-full rounded-lg border border-line object-cover"
              />
            ) : null}
            <Button className="mt-2 w-full" onClick={() => fileInput.current?.click()}>
              <Camera aria-hidden />
              {t(photo ? 'check.retake' : 'check.takePhoto')}
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setPhoto({ file, url: URL.createObjectURL(file) })
              }}
            />
          </div>
          {needsContainment ? (
            <div>
              <Label htmlFor="check-containment">{t('check.containmentLabel')}</Label>
              <Textarea
                id="check-containment"
                value={containment}
                onChange={(e) => setContainment(e.target.value)}
                placeholder={t('check.containmentHint')}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </Sheet>
  )
}
