import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Check } from 'lucide-react'
import { EvidenceLink } from '@/components/app/evidence-link'
import { LevelChip } from '@/components/app/ladder-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { EvidenceMap } from '@/lib/evidence-ref'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { requestEvidenceWindow } from '../api'
import { buyerKeys, type SourcingRow } from '../queries'

export function ProspectCard({
  row,
  certificates,
}: {
  row: SourcingRow
  certificates: EvidenceMap
}) {
  const t = useT()
  const f = useFormat()
  const queryClient = useQueryClient()
  const request = useServerFn(requestEvidenceWindow)
  const { tenant, profile } = row
  const mutation = useMutation({
    mutationFn: () => request({ data: { tenantId: tenant.id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: buyerKeys.all }),
    onError: (error) => toastError(t, error),
  })
  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start gap-3">
        <LevelChip level={profile.ladder} />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{tenant.name}</p>
          <p className="text-xs text-muted">
            {tenant.city} · {t(`country.${tenant.country}`)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {tenant.processes.map((p) => (
          <Badge key={p} tone="outline">
            {p}
          </Badge>
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted">{t('sourcing.evidenceDays')}</dt>
          <dd className="font-semibold text-heading tabular-nums">{profile.evidenceDays}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{t('sourcing.adherence')}</dt>
          <dd className="font-semibold text-heading tabular-nums">
            {f.percent(profile.checklistAdherence90d)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{t('heatmap.ftr')}</dt>
          <dd className="font-semibold text-heading tabular-nums">
            {f.percent(profile.firstTimeRight)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-muted">{profile.capacityNote}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {profile.certifications.map((c) => (
          <EvidenceLink key={c.evidenceId} evidence={certificates[c.evidenceId]} />
        ))}
      </div>
      <div className="mt-auto pt-4">
        {row.requested ? (
          <p className="inline-flex h-11 items-center gap-1.5 text-sm font-medium text-good">
            <Check className="size-4" aria-hidden />
            {t('sourcing.requested')}
          </p>
        ) : (
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {t('sourcing.request')}
          </Button>
        )}
      </div>
    </Card>
  )
}
