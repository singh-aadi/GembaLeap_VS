import { sealReport } from '@gembaleap/schemas'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Fingerprint, ShieldCheck } from 'lucide-react'
import { StatusBadge } from '@/components/app/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { verifyReportChain } from '../api'
import type { ReportDetail } from '../queries'

/**
 * Anyone holding the report can check it: the seal is recomputed here in the
 * browser from the report content, and the server re-hashes the audit chain.
 */
export function SealPanel({ data }: { data: ReportDetail }) {
  const t = useT()
  const f = useFormat()
  const verifyChain = useServerFn(verifyReportChain)
  const { report, auditEntry } = data

  const verify = useMutation({
    mutationFn: async () => {
      const [localSeal, chain] = await Promise.all([
        sealReport(report),
        verifyChain({ data: { id: report.id } }),
      ])
      return { sealMatches: localSeal === report.sealHash, ...chain }
    },
    onError: (error) => toastError(t, error),
  })

  if (!report.sealHash) return null
  const result = verify.data

  return (
    <Card>
      <CardHeader title={t('seal.title')} description={t('seal.hint')} />
      <CardBody className="space-y-4">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted">
              <Fingerprint className="size-3.5" aria-hidden />
              {t('seal.hash')}
            </dt>
            <dd className="mt-1 font-mono text-xs break-all">{report.sealHash}</dd>
          </div>
          {auditEntry ? (
            <div>
              <dt className="text-xs text-muted">{t('seal.entry', { seq: auditEntry.seq })}</dt>
              <dd className="mt-1 font-mono text-xs break-all text-muted">{auditEntry.hash}</dd>
              <dd className="mt-1 text-xs text-muted">
                {f.dateTime(auditEntry.at, data.timeZone)}
              </dd>
            </div>
          ) : null}
        </dl>
        <Button className="w-full" onClick={() => verify.mutate()} disabled={verify.isPending}>
          <ShieldCheck aria-hidden />
          {t('seal.verify')}
        </Button>
        {result ? (
          <ul className="space-y-2" aria-live="polite">
            <li className="flex items-center justify-between gap-2 text-sm">
              {t('seal.check.content')}
              <StatusBadge
                status={result.sealMatches ? 'pass' : 'fail'}
                label={t(result.sealMatches ? 'seal.match' : 'seal.mismatch')}
              />
            </li>
            <li className="flex items-center justify-between gap-2 text-sm">
              {t('seal.check.chain', { count: result.chainLength })}
              <StatusBadge
                status={result.chainIntact ? 'pass' : 'fail'}
                label={t(result.chainIntact ? 'seal.intact' : 'seal.broken')}
              />
            </li>
            <li className="flex items-center justify-between gap-2 text-sm">
              {t('seal.check.entry')}
              <StatusBadge
                status={result.entryFound ? 'pass' : 'fail'}
                label={t(result.entryFound ? 'seal.found' : 'seal.missing')}
              />
            </li>
          </ul>
        ) : null}
      </CardBody>
    </Card>
  )
}
