import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Check, FileClock, RotateCcw } from 'lucide-react'
import { AiBlock } from '@/components/app/ai-block'
import { BarList } from '@/components/app/bar-list'
import { ClaimList } from '@/components/app/claim-list'
import { ConfirmBar } from '@/components/app/confirm-bar'
import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { Stat } from '@/components/app/stat'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { acknowledgeShiftBrief, generateShiftBrief } from '../api'
import { shiftBriefKeys, shiftBriefQuery } from '../queries'

export function ShiftBriefPage() {
  const t = useT()
  const f = useFormat()
  const queryClient = useQueryClient()
  const generate = useServerFn(generateShiftBrief)
  const acknowledge = useServerFn(acknowledgeShiftBrief)
  const { data } = useSuspenseQuery(shiftBriefQuery())
  const invalidate = () => queryClient.invalidateQueries({ queryKey: shiftBriefKeys.all })

  const generateMutation = useMutation({
    mutationFn: () => generate(),
    onSuccess: invalidate,
    onError: (e) => toastError(t, e),
  })
  const ackMutation = useMutation({
    mutationFn: () => acknowledge(),
    onSuccess: invalidate,
    onError: (e) => toastError(t, e),
  })

  const regenerate = (
    <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
      <RotateCcw aria-hidden />
      {t('brief.generate')}
    </Button>
  )

  if (!data.brief) {
    return (
      <>
        <PageHeader title={t('brief.title')} />
        <Card>
          <EmptyState icon={FileClock} title={t('brief.none')} action={regenerate} />
        </Card>
      </>
    )
  }

  const { brief, timeZone } = data
  return (
    <>
      <PageHeader
        title={t('brief.title')}
        meta={t('brief.meta', {
          shift: brief.shift,
          start: f.time(brief.shiftStart, timeZone),
          end: f.time(brief.shiftEnd, timeZone),
          at: f.time(brief.generatedAt, timeZone),
        })}
        actions={regenerate}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="p-4">
          <AiBlock
            approved={Boolean(brief.acknowledgedBy)}
            approvedLabel={
              data.acknowledgedByName
                ? t('brief.acknowledgedBy', { name: data.acknowledgedByName })
                : undefined
            }
          >
            <h2 className="mt-2 text-sm">{t('brief.happened')}</h2>
            <div className="mt-3">
              <ClaimList claims={brief.happened} evidence={data.evidence} timeZone={timeZone} />
            </div>
            <h2 className="mt-6 text-sm">{t('brief.watch')}</h2>
            <div className="mt-3">
              <ClaimList claims={brief.watch} evidence={data.evidence} timeZone={timeZone} />
            </div>
          </AiBlock>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader title={t('brief.checks')} />
            <CardBody>
              <dl className="grid grid-cols-3 gap-3">
                <Stat label={t('brief.checks.done')} value={brief.checks.done} />
                <Stat label={t('brief.checks.due')} value={brief.checks.due} />
                <Stat
                  label={t('brief.checks.ool')}
                  value={brief.checks.outOfLimit}
                  tone={brief.checks.outOfLimit > 0 ? 'bad' : undefined}
                />
              </dl>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title={t('brief.pareto')} />
            <CardBody>
              <BarList
                rows={brief.pareto.map((p) => ({ label: p.label, value: p.minutes }))}
                format={(v) => t('common.minutes', { n: v })}
              />
            </CardBody>
          </Card>
        </div>
      </div>
      {!brief.acknowledgedBy ? (
        <ConfirmBar note={t('brief.ackNote')}>
          <Button
            variant="primary"
            onClick={() => ackMutation.mutate()}
            disabled={ackMutation.isPending}
          >
            <Check aria-hidden />
            {t('brief.acknowledge')}
          </Button>
        </ConfirmBar>
      ) : null}
    </>
  )
}
