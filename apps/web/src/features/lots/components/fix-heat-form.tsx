import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { toast } from 'sonner'
import { PhotoInput, type CapturedPhoto } from '@/components/app/photo-input'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/field'
import { toastError } from '@/lib/errors'
import { useT } from '@/lib/i18n'
import { fixHeatNumber } from '../api'
import { lotKeys } from '../queries'

export function FixHeatForm({ lotId }: { lotId: string }) {
  const t = useT()
  const queryClient = useQueryClient()
  const fix = useServerFn(fixHeatNumber)
  const [heat, setHeat] = useState('')
  const [photo, setPhoto] = useState<CapturedPhoto>()

  const mutation = useMutation({
    mutationFn: () => {
      if (!photo) throw new Error('[VALIDATION]')
      return fix({
        data: {
          lotId,
          certificateHeatNo: heat,
          evidence: { sha256: photo.sha256, storagePath: `uploads/pending/${photo.sha256}.jpg` },
        },
      })
    },
    onSuccess: ({ result }) => {
      if (result === 'pass') toast.success(t('passport.fixed'))
      else toast.error(t('passport.stillMismatch'))
      void queryClient.invalidateQueries({ queryKey: lotKeys.all })
    },
    onError: (error) => toastError(t, error),
  })

  return (
    <Card>
      <CardHeader title={t('passport.fix')} description={t('passport.fixHint')} />
      <CardBody className="space-y-4">
        <div>
          <Label htmlFor="cert-heat">{t('passport.certHeat')}</Label>
          <Input
            id="cert-heat"
            value={heat}
            onChange={(e) => setHeat(e.target.value.toUpperCase())}
            className="font-mono"
          />
        </div>
        <PhotoInput
          value={photo}
          onChange={setPhoto}
          label={t('passport.scanCert')}
          retakeLabel={t('check.retake')}
          alt={t('passport.certificate')}
        />
        <Button
          className="w-full"
          disabled={!photo || heat.length < 4 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {t('passport.recheck')}
        </Button>
      </CardBody>
    </Card>
  )
}
