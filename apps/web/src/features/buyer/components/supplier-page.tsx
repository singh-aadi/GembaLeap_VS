import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { MessageCircleQuestion } from 'lucide-react'
import { useState } from 'react'
import { BackLink } from '@/components/app/back-link'
import { LevelChip } from '@/components/app/ladder-bar'
import { PageHeader } from '@/components/app/page-header'
import { Stat, StatRow } from '@/components/app/stat'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScoreGrid } from '@/features/maturity/components/score-grid'
import { ScoreSheet } from '@/features/maturity/components/score-sheet'
import type { MaturityCell } from '@/features/maturity/queries'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import { supplierDetailQuery } from '../queries'
import { DriftBadge } from './drift-badge'
import { PaymentCard } from './payment-card'
import { SharedLists } from './shared-lists'
import { TierCard } from './tier-card'

const route = getRouteApi('/b/suppliers/$tenantId')

export function SupplierPage() {
  const t = useT()
  const f = useFormat()
  const pick = useLocalized()
  const { tenantId } = route.useParams()
  const { data } = useSuspenseQuery(supplierDetailQuery(tenantId))
  const [cell, setCell] = useState<MaturityCell | null>(null)
  const { card, tenant } = data
  const stage = data.maturity?.stages.find((s) => s.id === cell?.stageId)

  return (
    <>
      <PageHeader
        back={
          <BackLink to="/b/suppliers" search={{ sort: 'risk', view: 'table' }}>
            {t('nav.suppliers')}
          </BackLink>
        }
        title={tenant.name}
        meta={
          <span className="inline-flex flex-wrap items-center gap-2">
            {tenant.city} · {tenant.processes.join(', ')}
            <DriftBadge drift={card.drift} />
          </span>
        }
        actions={
          <Button asChild>
            <Link to="/b/ask" search={{ supplier: tenant.id }}>
              <MessageCircleQuestion aria-hidden />
              {t('nav.ask')}
            </Link>
          </Button>
        }
      />
      <p className="-mt-2 mb-4 flex flex-wrap items-center gap-1 text-xs text-muted">
        {t('supplier.sharing')}
        {data.scope.map((s) => (
          <Badge key={s} tone="outline">
            {t(`scope.${s}`)}
          </Badge>
        ))}
        <span>· {t('sharing.expires', { date: f.date(data.consentExpiresAt) })}</span>
      </p>
      <StatRow className="mb-4">
        <Stat
          label={t('heatmap.ladder')}
          value={<LevelChip level={card.ladder} />}
          hint={t('home.index', { index: f.number(card.siteIndex, 1) })}
        />
        <Stat
          label={t('heatmap.adherence')}
          value={f.percent(card.checklistAdherence30d)}
          tone={card.checklistAdherence30d < 0.85 ? 'warn' : undefined}
        />
        <Stat
          label={t('heatmap.ftr')}
          value={f.percent(card.firstTimeRight, 1)}
          hint={t('heatmap.streak', { count: card.ftrStreak })}
        />
        <Stat label={t('heatmap.otif')} value={f.percent(card.otif)} />
        <Stat
          label={t('heatmap.eightD')}
          value={t('heatmap.days', { n: f.number(card.eightDMedianDays) })}
          hint={t('supplier.openNcrs', { count: card.openNcrs })}
        />
      </StatRow>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <SharedLists data={data} />
          {data.maturity ? (
            <section>
              <h2 className="mb-2 text-sm">{t('nav.maturity')}</h2>
              <ScoreGrid stages={data.maturity.stages} onSelect={setCell} />
            </section>
          ) : null}
        </div>
        <div className="space-y-4">
          <TierCard data={data} />
          <PaymentCard data={data} />
        </div>
      </div>
      {data.maturity ? (
        <ScoreSheet
          cell={cell}
          stageName={stage ? pick(stage.name) : ''}
          evidence={data.maturity.evidence}
          timeZone={data.timeZone}
          readOnly
          onClose={() => setCell(null)}
        />
      ) : null}
    </>
  )
}
