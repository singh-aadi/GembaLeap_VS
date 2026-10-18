import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/field'
import { Sheet } from '@/components/ui/sheet'
import { raiseNcr } from '@/features/ncr/api'
import { toastError } from '@/lib/errors'
import { useT } from '@/lib/i18n'

export function RaiseNcrSheet({
  lotId,
  lotNo,
  open,
  onOpenChange,
}: {
  lotId: string
  lotNo: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useT()
  const navigate = useNavigate()
  const raise = useServerFn(raiseNcr)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const mutation = useMutation({
    mutationFn: () => raise({ data: { lotId, title, description } }),
    onSuccess: ({ id }) => void navigate({ to: '/b/ncr/$ncrId', params: { ncrId: id } }),
    onError: (error) => toastError(t, error),
  })
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('ncr.raise')}
      description={t('ncr.raiseFor', { lot: lotNo })}
      closeLabel={t('common.close')}
      footer={
        <Button
          variant="primary"
          className="w-full"
          disabled={title.trim().length < 5 || description.trim().length < 10 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {t('ncr.raiseSend')}
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="ncr-title">{t('ncr.titleLabel')}</Label>
          <Input id="ncr-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ncr-description">{t('ncr.descriptionLabel')}</Label>
          <Textarea
            id="ncr-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>
      </div>
    </Sheet>
  )
}
