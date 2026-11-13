import { useSuspenseQuery } from '@tanstack/react-query'
import { CircleCheck, CircleDashed, Gift, Lock } from 'lucide-react'
import { EvidenceList } from '@/components/app/evidence-link'
import { LevelChip } from '@/components/app/ladder-bar'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, Td, Th } from '@/components/ui/table'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { levelQuery } from '../queries'
import { Ladder } from './ladder'

/** Where the plant stands, the one gap blocking the next level, and what that level earns. */
export function LevelPage() {
  const t = useT()
  const f = useFormat()
  const { data } = useSuspenseQuery(levelQuery())
  const gaps = new Set(data.promotionGaps)
  const streakRows = [
    {
      key: 'streak_days' as const,
      label: t('level.streakDays', { days: data.streak.days, needed: data.streakNeeded }),
      value: data.streak.days,
      max: Math.max(1, data.streakNeeded),
    },
    {
      key: 'adherence' as const,
      label: t('level.adherence', { value: f.percent(data.streak.adherence) }),
      value: Math.round(data.streak.adherence * 100),
      max: 95,
    },
    {
      key: 'buyer_verification' as const,
      label: t(data.streak.buyerVerified ? 'level.verified' : 'level.notVerified'),
      value: data.streak.buyerVerified ? 1 : 0,
      max: 1,
    },
  ]
  return (
    <>
      <PageHeader
        title={t('nav.level')}
        meta={
          <span className="inline-flex flex-wrap items-center gap-2">
            {data.siteName}
            <Badge tone="outline">{t(`tier.storage.${data.tier}`)}</Badge>
          </span>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card>
            <CardBody className="flex flex-wrap items-center gap-4">
              <LevelChip level={data.level} className="h-12 min-w-14 text-base" />
              <div className="min-w-0 flex-1">
                <p className="text-xl font-semibold text-heading">
                  {t(`sutra.level.${KEYS[data.level] ?? 'invisible'}`)}
                </p>
                <p className="text-sm text-muted">
                  {t('level.nextIs', { name: t(`sutra.level.${KEYS[data.next] ?? 'invisible'}`) })}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={t('level.blocking', { level: data.next })}
              description={t('level.blockingHint')}
            />
            <ul className="divide-y divide-line">
              {data.blocking.map((d) => (
                <li key={d.dimension} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{t(`dimension.${d.dimension}`)}</p>
                    <LevelChip level={d.level} />
                  </div>
                  {d.nextGap ? <p className="mt-1 text-sm text-ink">{d.nextGap}</p> : null}
                  <EvidenceList
                    ids={d.evidenceIds}
                    evidence={data.evidence}
                    timeZone={data.timeZone}
                  />
                </li>
              ))}
              {streakRows
                .filter((r) => (r.key === 'streak_days' ? data.streakNeeded > 0 : data.next >= 3))
                .map((r) => (
                  <li key={r.key} className="flex items-center gap-3 px-4 py-3">
                    {gaps.has(r.key) ? (
                      <CircleDashed className="size-5 text-warn-ink" aria-hidden />
                    ) : (
                      <CircleCheck className="size-5 text-good" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{r.label}</p>
                      <Progress
                        className="mt-1"
                        value={Math.min(r.value, r.max)}
                        max={r.max}
                        label={r.label}
                        tone={gaps.has(r.key) ? 'warn' : 'good'}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title={t('level.dimensions')} />
            <Table>
              <thead>
                <tr>
                  <Th>{t('level.dimension')}</Th>
                  <Th>{t('maturity.stageLevel')}</Th>
                  <Th>{t('level.why')}</Th>
                </tr>
              </thead>
              <tbody>
                {data.dimensions.map((d) => (
                  <tr key={d.dimension}>
                    <Td className="font-medium">{t(`dimension.${d.dimension}`)}</Td>
                    <Td>
                      <LevelChip level={d.level} />
                    </Td>
                    <Td className="text-muted">{d.rationale}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title={t('level.earns')} description={t('level.earnsHint')} />
            <ul className="divide-y divide-line">
              {data.rewards.length === 0 ? (
                <li className="px-4 py-3 text-sm text-muted">{t('level.noRewards')}</li>
              ) : null}
              {data.rewards.map((r) => (
                <li key={`${r.buyerTenantId}-${r.level}`} className="flex gap-3 px-4 py-3">
                  {r.unlocked ? (
                    <Gift className="mt-0.5 size-4 text-good" aria-hidden />
                  ) : (
                    <Lock className="mt-0.5 size-4 text-muted" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      L{r.level} · {t(`reward.${r.reward}`)}
                    </p>
                    <p className="text-xs text-muted">
                      {r.buyerName} · {r.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title={t('level.ladder')} />
            <CardBody>
              <Ladder level={data.level} />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}

const KEYS = ['invisible', 'recorded', 'controlled', 'proven', 'improving', 'connected'] as const
