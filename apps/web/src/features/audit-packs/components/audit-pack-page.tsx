import { AuditStandard } from '@sutraos/schemas'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { CircleCheck, TriangleAlert } from 'lucide-react'
import { EvidenceList } from '@/components/app/evidence-link'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { auditPackQuery } from '../queries'

const route = getRouteApi('/s/audit-packs')

/** Clause-to-evidence map for ZED, ISO 9001 or IATF 16949. Gaps are shown, never filled in. */
export function AuditPackPage() {
  const t = useT()
  const { standard } = route.useSearch()
  const navigate = route.useNavigate()
  const { data } = useSuspenseQuery(auditPackQuery(standard))
  return (
    <>
      <PageHeader
        title={t('nav.auditPacks')}
        meta={t('auditPack.meta', { covered: data.covered, total: data.clauses.length })}
      />
      <div
        role="tablist"
        aria-label={t('auditPack.standard')}
        className="mb-4 inline-flex rounded-lg border border-line bg-surface p-0.5"
      >
        {AuditStandard.options.map((s) => (
          <button
            key={s}
            role="tab"
            type="button"
            aria-selected={s === standard}
            onClick={() => void navigate({ search: { standard: s }, replace: true })}
            className={cn(
              'h-10 rounded-md px-4 text-sm',
              s === standard ? 'bg-accent-soft font-medium text-accent' : 'text-muted',
            )}
          >
            {t(`auditPack.std.${s}`)}
          </button>
        ))}
      </div>
      <Card>
        <CardHeader title={t(`auditPack.std.${standard}`)} description={t('auditPack.hint')} />
        <div className="px-4 pt-3">
          <Progress
            value={data.covered}
            max={data.clauses.length}
            label={t('auditPack.coverage')}
            tone={data.covered === data.clauses.length ? 'good' : 'warn'}
          />
        </div>
        <ul className="mt-3 divide-y divide-line border-t border-line">
          {data.clauses.map((c) => (
            <li key={c.ref} className="flex gap-3 px-4 py-3">
              {c.gap ? (
                <TriangleAlert
                  className="mt-0.5 size-5 shrink-0 text-warn-ink"
                  aria-label={t('auditPack.gap')}
                />
              ) : (
                <CircleCheck
                  className="mt-0.5 size-5 shrink-0 text-good"
                  aria-label={t('auditPack.covered')}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="mr-2 font-mono text-xs text-muted">{c.ref}</span>
                  {c.title}
                </p>
                {c.gap ? (
                  <p className="mt-1 text-sm font-medium text-warn-ink">{c.gap}</p>
                ) : (
                  <EvidenceList
                    ids={c.evidenceIds}
                    evidence={data.evidence}
                    timeZone={data.timeZone}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
