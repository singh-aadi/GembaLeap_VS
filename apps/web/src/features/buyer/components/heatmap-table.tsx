import { Link } from '@tanstack/react-router'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { LevelChip } from '@/components/app/ladder-bar'
import { Sparkline } from '@/components/app/sparkline'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, Td, Th } from '@/components/ui/table'
import { cn } from '@/lib/cn'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { HeatmapRow } from '../queries'
import { DriftBadge } from './drift-badge'

function Ratio({ value, warnBelow }: { value: number; warnBelow: number }) {
  const f = useFormat()
  return (
    <span className={cn('tabular-nums', value < warnBelow && 'font-medium text-warn-ink')}>
      {f.percent(value, value >= 0.99 ? 1 : 0)}
    </span>
  )
}

export function HeatmapTable({ rows }: { rows: HeatmapRow[] }) {
  const t = useT()
  const f = useFormat()
  return (
    <>
      <Card className="hidden lg:block">
        <Table>
          <thead>
            <tr>
              <Th>{t('heatmap.supplier')}</Th>
              <Th>{t('heatmap.ladder')}</Th>
              <Th className="text-right">{t('heatmap.adherence30')}</Th>
              <Th className="text-right">{t('heatmap.ftr')}</Th>
              <Th className="text-right">{t('heatmap.otif')}</Th>
              <Th className="text-right">{t('heatmap.ncrs')}</Th>
              <Th className="text-right">{t('heatmap.eightD')}</Th>
              <Th>{t('heatmap.trend')}</Th>
              <Th>{t('heatmap.tier')}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-subtle/60">
                <Td className="min-w-52">
                  <Link
                    to="/b/suppliers/$tenantId"
                    params={{ tenantId: row.id }}
                    className="font-medium hover:text-accent"
                  >
                    {row.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {row.city} · {t(`sector.${row.sector}`)}
                  </p>
                </Td>
                <Td>
                  <span className="inline-flex items-center gap-2">
                    <LevelChip level={row.ladder} />
                    <Sparkline
                      values={row.trend}
                      label={t('heatmap.trendAria', { name: row.name })}
                    />
                  </span>
                </Td>
                <Td className="text-right">
                  <Ratio value={row.checklistAdherence30d} warnBelow={0.85} />
                </Td>
                <Td className="text-right">
                  <Ratio value={row.firstTimeRight} warnBelow={0.9} />
                  <span className="block text-xs text-muted">
                    {t('heatmap.streak', { count: row.ftrStreak })}
                  </span>
                </Td>
                <Td className="text-right">
                  <Ratio value={row.otif} warnBelow={0.9} />
                </Td>
                <Td
                  className={cn(
                    'text-right tabular-nums',
                    row.openNcrs > 0 && 'font-medium text-bad',
                  )}
                >
                  {row.openNcrs}
                </Td>
                <Td className="text-right tabular-nums">
                  {t('heatmap.days', { n: f.number(row.eightDMedianDays) })}
                </Td>
                <Td>
                  <DriftBadge drift={row.drift} />
                </Td>
                <Td>
                  <span className="inline-flex items-center gap-1">
                    <Badge>{t(`tier.${row.inspectionTier}`)}</Badge>
                    {row.suggestedTier ? (
                      <>
                        <ArrowRight
                          className="size-3.5 text-muted"
                          aria-label={t('heatmap.suggested')}
                        />
                        <Badge tone="teal">{t(`tier.${row.suggestedTier}`)}</Badge>
                      </>
                    ) : null}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <ul className="space-y-2 lg:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <Link
              to="/b/suppliers/$tenantId"
              params={{ tenantId: row.id }}
              className="block rounded-lg border border-line bg-surface p-3"
            >
              <div className="flex items-start gap-3">
                <LevelChip level={row.ladder} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{row.name}</p>
                  <p className="text-xs text-muted">
                    {row.city} · {t(`sector.${row.sector}`)}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-muted">{t('heatmap.adherenceShort')}</dt>
                  <dd>
                    <Ratio value={row.checklistAdherence30d} warnBelow={0.85} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{t('heatmap.ftr')}</dt>
                  <dd>
                    <Ratio value={row.firstTimeRight} warnBelow={0.9} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{t('heatmap.ncrs')}</dt>
                  <dd className="tabular-nums">{row.openNcrs}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <DriftBadge drift={row.drift} />
                <Badge>{t(`tier.${row.inspectionTier}`)}</Badge>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
