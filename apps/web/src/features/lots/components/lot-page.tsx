import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { FileWarning, Fingerprint, Lock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BackLink } from '@/components/app/back-link'
import { ConfirmBar } from '@/components/app/confirm-bar'
import { PageHeader } from '@/components/app/page-header'
import { StatusBadge } from '@/components/app/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { sealPassport } from '../api'
import { lotDetailQuery, lotKeys } from '../queries'
import { FixHeatForm } from './fix-heat-form'
import { PassportChecks } from './passport-checks'
import { RaiseNcrSheet } from './raise-ncr-sheet'

/** Lot passport for both sides. Suppliers fix and seal; buyers read the sealed record and can raise an NCR. */
export function LotPage({ lotId, side }: { lotId: string; side: 'supplier' | 'buyer' }) {
  const t = useT()
  const f = useFormat()
  const queryClient = useQueryClient()
  const seal = useServerFn(sealPassport)
  const { data } = useSuspenseQuery(lotDetailQuery(lotId))
  const { lot, passport, timeZone } = data
  const [raising, setRaising] = useState(false)

  const sealMutation = useMutation({
    mutationFn: () => seal({ data: { id: lotId } }),
    onSuccess: () => {
      toast.success(t('passport.sealedToast'))
      void queryClient.invalidateQueries({ queryKey: lotKeys.all })
    },
    onError: (error) => toastError(t, error),
  })

  const heatFailed = passport.checks.some((c) => c.rule === 'heat_match' && c.result === 'fail')

  return (
    <>
      <PageHeader
        back={
          side === 'supplier' ? (
            <BackLink to="/s/lots">{t('nav.lots')}</BackLink>
          ) : (
            <BackLink to="/b/suppliers/$tenantId" params={{ tenantId: lot.tenantId }}>
              {data.supplierName}
            </BackLink>
          )
        }
        title={<span className="font-mono">{lot.lotNo}</span>}
        meta={`${lot.partNo} · ${lot.partName}`}
        actions={
          side === 'buyer' ? (
            <Button onClick={() => setRaising(true)}>
              <FileWarning aria-hidden />
              {t('ncr.raise')}
            </Button>
          ) : undefined
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <PassportChecks data={data} />
        <div className="space-y-4">
          <Card>
            <CardHeader
              title={t('passport.lot')}
              action={
                <StatusBadge
                  status={passport.overall}
                  label={t(`passport.status.${passport.status}`)}
                />
              }
            />
            <CardBody>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted">{t('passport.po')}</dt>
                <dd className="font-mono text-xs">{lot.poNumber}</dd>
                <dt className="text-muted">{t('passport.qty')}</dt>
                <dd className="tabular-nums">{f.number(lot.qty)}</dd>
                <dt className="text-muted">{t('passport.heat')}</dt>
                <dd className="font-mono text-xs">{lot.heatNo ?? '—'}</dd>
                <dt className="text-muted">{t('passport.produced')}</dt>
                <dd>{f.date(lot.producedAt, timeZone)}</dd>
                <dt className="text-muted">{t('passport.buyer')}</dt>
                <dd>{data.buyerName}</dd>
                <dt className="text-muted">{t('passport.version')}</dt>
                <dd className="tabular-nums">v{passport.version}</dd>
              </dl>
            </CardBody>
          </Card>
          {passport.sealedHash ? (
            <Card>
              <CardHeader
                title={t('passport.seal')}
                action={
                  <Badge tone="good">
                    <Lock aria-hidden />
                    {t('passport.status.sealed')}
                  </Badge>
                }
              />
              <CardBody className="space-y-2 text-sm">
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Fingerprint className="size-3.5" aria-hidden />
                  SHA-256
                </p>
                <p className="font-mono text-xs break-all">{passport.sealedHash}</p>
                {passport.sealedAt ? (
                  <p className="text-xs text-muted">
                    {t('passport.sealedBy', {
                      name: data.sealedByName ?? '',
                      time: f.dateTime(passport.sealedAt, timeZone),
                    })}
                  </p>
                ) : null}
              </CardBody>
            </Card>
          ) : null}
          {side === 'supplier' && heatFailed ? <FixHeatForm lotId={lot.id} /> : null}
          {data.ncrs.length > 0 ? (
            <Card>
              <CardHeader title={t('cycle.linkedNcrs')} />
              <ul className="divide-y divide-line">
                {data.ncrs.map((ncr) => (
                  <li key={ncr.id}>
                    {side === 'supplier' ? (
                      <Link
                        to="/s/ncr/$ncrId"
                        params={{ ncrId: ncr.id }}
                        className="flex h-12 items-center justify-between px-4 text-sm hover:bg-subtle/60"
                      >
                        <span className="font-mono">{ncr.number}</span>
                        <Badge>{t(`ncr.status.${ncr.status}`)}</Badge>
                      </Link>
                    ) : (
                      <Link
                        to="/b/ncr/$ncrId"
                        params={{ ncrId: ncr.id }}
                        className="flex h-12 items-center justify-between px-4 text-sm hover:bg-subtle/60"
                      >
                        <span className="font-mono">{ncr.number}</span>
                        <Badge>{t(`ncr.status.${ncr.status}`)}</Badge>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
      {side === 'supplier' && passport.status === 'ready' ? (
        <ConfirmBar note={t('passport.sealNote', { buyer: data.buyerName })}>
          <Button
            variant="primary"
            disabled={sealMutation.isPending}
            onClick={() => sealMutation.mutate()}
          >
            <Lock aria-hidden />
            {t('passport.sealAction')}
          </Button>
        </ConfirmBar>
      ) : null}
      {side === 'buyer' ? (
        <RaiseNcrSheet lotId={lot.id} lotNo={lot.lotNo} open={raising} onOpenChange={setRaising} />
      ) : null}
    </>
  )
}
