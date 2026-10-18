import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { toast } from 'sonner'
import { PhotoInput, type CapturedPhoto } from '@/components/app/photo-input'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/field'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { closeCycle } from '../api'
import { cycleKeys, type CycleDetail } from '../queries'

export function CloseCycleForm({
  cycle,
  timeZone,
}: {
  cycle: CycleDetail['cycle']
  timeZone: string
}) {
  const t = useT()
  const f = useFormat()
  const queryClient = useQueryClient()
  const close = useServerFn(closeCycle)
  const [photo, setPhoto] = useState<CapturedPhoto>()
  const [result, setResult] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      close({
        data: {
          cycleId: cycle.id,
          resultValue: Number(result),
          evidence: photo
            ? [{ sha256: photo.sha256, storagePath: `uploads/pending/${photo.sha256}.jpg` }]
            : [],
        },
      }),
    onSuccess: () => {
      toast.success(t('cycle.closed'))
      void queryClient.invalidateQueries({ queryKey: cycleKeys.all })
    },
    onError: (error) => toastError(t, error),
  })

  const ready =
    Boolean(photo) && result !== '' && !Number.isNaN(Number(result)) && Boolean(cycle.fixAppliedAt)

  return (
    <Card>
      <CardHeader
        title={t('cycle.verifyClose')}
        description={
          cycle.fixAppliedAt
            ? t('cycle.verifyRule', { date: f.date(cycle.fixAppliedAt, timeZone) })
            : t('cycle.noFixYet')
        }
      />
      <CardBody className="space-y-4">
        <div>
          <Label htmlFor="cycle-result">
            {t('cycle.resultLabel', { unit: cycle.baseline.unit })}
          </Label>
          <Input
            id="cycle-result"
            inputMode="decimal"
            type="number"
            min={0}
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="max-w-40 tabular-nums"
          />
        </div>
        <PhotoInput
          value={photo}
          onChange={setPhoto}
          label={t('cycle.addEvidence')}
          retakeLabel={t('check.retake')}
          alt={t('cycle.after')}
        />
        <Button
          variant="primary"
          className="w-full"
          disabled={!ready || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {t('cycle.close')}
        </Button>
      </CardBody>
    </Card>
  )
}
