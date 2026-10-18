import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { BackLink } from '@/components/app/back-link'
import { ConfirmBar } from '@/components/app/confirm-bar'
import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { acceptEightD, approveEightD, draftEightD } from '../api'
import { ncrDetailQuery, ncrKeys } from '../queries'
import { EightDView } from './eight-d-view'
import { NcrThread } from './ncr-thread'

/** Shared NCR room. The same screen serves both companies; actions follow the side. */
export function NcrRoom({ ncrId }: { ncrId: string }) {
  const t = useT()
  const f = useFormat()
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(ncrDetailQuery(ncrId))
  const { ncr, side } = data
  const approve = useServerFn(approveEightD)
  const accept = useServerFn(acceptEightD)
  const draft = useServerFn(draftEightD)

  const onDone = (message?: string) => () => {
    if (message) toast.success(message)
    void queryClient.invalidateQueries({ queryKey: ncrKeys.all })
  }
  const approveMutation = useMutation({
    mutationFn: () => approve({ data: { id: ncrId } }),
    onSuccess: onDone(t('ncr.sent')),
    onError: (e) => toastError(t, e),
  })
  const acceptMutation = useMutation({
    mutationFn: () => accept({ data: { id: ncrId } }),
    onSuccess: onDone(t('ncr.acceptedToast')),
    onError: (e) => toastError(t, e),
  })
  const draftMutation = useMutation({
    mutationFn: () => draft({ data: { id: ncrId } }),
    onSuccess: onDone(),
    onError: (e) => toastError(t, e),
  })

  return (
    <>
      <PageHeader
        back={
          side === 'supplier' ? (
            <BackLink to="/s/ncr">{t('nav.ncr')}</BackLink>
          ) : (
            <BackLink to="/b/ncr">{t('nav.ncr')}</BackLink>
          )
        }
        title={
          <span>
            <span className="mr-2 font-mono text-base text-muted">{ncr.number}</span>
            {ncr.title}
          </span>
        }
        meta={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge>{t(`ncr.status.${ncr.status}`)}</Badge>
            <span>
              {t('ncr.meta', {
                buyer: data.buyerName,
                supplier: data.supplierName,
                date: f.date(ncr.raisedAt, data.timeZone),
              })}
            </span>
            <span className="font-mono text-xs">{data.lotNo}</span>
          </span>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="p-4">
          <p className="mb-4 text-sm text-muted">{ncr.description}</p>
          {ncr.eightD ? (
            <EightDView data={data} />
          ) : (
            <EmptyState
              icon={Sparkles}
              title={t('ncr.noEightD')}
              action={
                side === 'supplier' ? (
                  <Button onClick={() => draftMutation.mutate()} disabled={draftMutation.isPending}>
                    <Sparkles aria-hidden />
                    {t('ncr.draft')}
                  </Button>
                ) : undefined
              }
            />
          )}
        </Card>
        <div className="lg:self-start">
          <NcrThread data={data} />
        </div>
      </div>
      {side === 'supplier' && ncr.status === 'eight_d_draft' ? (
        <ConfirmBar
          note={
            data.missingCitations.length > 0
              ? t('ncr.missingNote', { count: data.missingCitations.length })
              : t('ncr.approveNote', { buyer: data.buyerName })
          }
        >
          <Button
            variant="primary"
            disabled={data.missingCitations.length > 0 || approveMutation.isPending}
            onClick={() => approveMutation.mutate()}
          >
            <Check aria-hidden />
            {t('ncr.approve')}
          </Button>
        </ConfirmBar>
      ) : null}
      {side === 'buyer' && ncr.status === 'eight_d_submitted' ? (
        <ConfirmBar note={t('ncr.acceptNote')}>
          <Button
            variant="primary"
            disabled={acceptMutation.isPending}
            onClick={() => acceptMutation.mutate()}
          >
            <Check aria-hidden />
            {t('ncr.accept')}
          </Button>
        </ConfirmBar>
      ) : null}
    </>
  )
}
