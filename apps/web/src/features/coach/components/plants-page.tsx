import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { LevelChip } from '@/components/app/ladder-bar'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useT } from '@/lib/i18n'
import { plantsQuery } from '../queries'

export function PlantsPage() {
  const t = useT()
  const { data } = useSuspenseQuery(plantsQuery())
  return (
    <>
      <PageHeader title={t('nav.plants')} meta={t('coach.meta', { count: data.length })} />
      <Card>
        <ul className="divide-y divide-line">
          {data.map((p) => (
            <li key={p.siteId}>
              <Link
                to="/c/plants/$siteId"
                params={{ siteId: p.siteId }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-subtle/60"
              >
                <LevelChip level={p.level} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{p.plant}</p>
                  <p className="text-xs text-muted">
                    {p.site} · {p.cluster}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge tone={p.baseline === 'reviewed' ? 'good' : 'warn'}>
                      {t(`coach.baseline.${p.baseline}`)}
                    </Badge>
                    <Badge tone={p.mapped ? 'good' : 'neutral'}>
                      {t(p.mapped ? 'coach.mapped' : 'coach.notMapped')}
                    </Badge>
                    <Badge tone={p.skillsOn >= 5 ? 'teal' : 'neutral'}>
                      {t('coach.skillsOn', { count: p.skillsOn })}
                    </Badge>
                    <Badge tone="outline">{t(`tier.storage.${p.tier}`)}</Badge>
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
