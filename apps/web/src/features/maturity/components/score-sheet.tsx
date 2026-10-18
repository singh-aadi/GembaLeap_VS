import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { AiBlock } from '@/components/app/ai-block'
import { EvidenceList } from '@/components/app/evidence-link'
import { LevelChip } from '@/components/app/ladder-bar'
import { Button } from '@/components/ui/button'
import { Label, Textarea } from '@/components/ui/field'
import { Sheet } from '@/components/ui/sheet'
import type { EvidenceMap } from '@/lib/evidence-ref'
import { toastError } from '@/lib/errors'
import { useT } from '@/lib/i18n'
import { ladderName } from '@/lib/ladder'
import { reviewScore } from '../api'
import { maturityKeys, type MaturityCell } from '../queries'

/** One score: the auditor's rationale, the evidence, and the owner's accept or dispute. */
export function ScoreSheet({
  cell,
  stageName,
  evidence,
  timeZone,
  readOnly = false,
  onClose,
}: {
  cell: MaturityCell | null
  stageName: string
  evidence: EvidenceMap
  timeZone: string
  readOnly?: boolean
  onClose: () => void
}) {
  const t = useT()
  const queryClient = useQueryClient()
  const review = useServerFn(reviewScore)
  const [disputing, setDisputing] = useState(false)
  const [comment, setComment] = useState('')

  const mutation = useMutation({
    mutationFn: (state: 'accepted' | 'disputed') => {
      if (!cell) throw new Error('[VALIDATION]')
      return review({
        data: {
          assessmentId: cell.assessmentId,
          stageId: cell.stageId,
          dimension: cell.dimension,
          state,
          comment: state === 'disputed' ? comment : undefined,
        },
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maturityKeys.all })
      close()
    },
    onError: (error) => toastError(t, error),
  })

  function close() {
    setDisputing(false)
    setComment('')
    onClose()
  }

  const canReview = !readOnly && cell?.state === 'draft'

  return (
    <Sheet
      open={cell !== null}
      onOpenChange={(open) => !open && close()}
      title={cell ? `${stageName} · ${t(`dimension.${cell.dimension}`)}` : ''}
      closeLabel={t('common.close')}
      footer={
        canReview ? (
          disputing ? (
            <Button
              variant="primary"
              className="w-full"
              disabled={!comment.trim() || mutation.isPending}
              onClick={() => mutation.mutate('disputed')}
            >
              {t('score.sendDispute')}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => setDisputing(true)}>{t('score.dispute')}</Button>
              <Button
                variant="primary"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate('accepted')}
              >
                {t('score.accept')}
              </Button>
            </div>
          )
        ) : undefined
      }
    >
      {cell ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <LevelChip level={cell.level} />
            <span className="text-sm">{t(ladderName(cell.level))}</span>
          </div>
          <AiBlock approved={cell.state === 'accepted'} approvedLabel={t('score.state.accepted')}>
            <p className="text-sm">{cell.rationale}</p>
            <EvidenceList ids={cell.evidenceIds} evidence={evidence} timeZone={timeZone} />
          </AiBlock>
          {cell.state === 'disputed' && cell.comment ? (
            <p className="rounded-md border-l-2 border-bad bg-bad-soft px-3 py-2 text-sm">
              <span className="font-medium">{t('score.disputeComment')}: </span>
              {cell.comment}
            </p>
          ) : null}
          {disputing ? (
            <div>
              <Label htmlFor="dispute-comment">{t('score.disputeLabel')}</Label>
              <Textarea
                id="dispute-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </Sheet>
  )
}
