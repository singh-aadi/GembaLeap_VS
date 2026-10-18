import { Dimension } from '@gembaleap/schemas'
import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import type { HeatmapRow } from '../queries'

const LADDER = ['ladder-0', 'ladder-1', 'ladder-2', 'ladder-3', 'ladder-4', 'ladder-5'] as const

/** Suppliers × maturity dimensions. Suppliers who did not share maturity show a hatched cell. */
export function HeatmapGrid({ rows }: { rows: HeatmapRow[] }) {
  const t = useT()
  return (
    <Card className="overflow-x-auto p-4">
      <table className="w-full min-w-[640px] border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="text-left text-xs font-medium text-muted">{t('heatmap.supplier')}</th>
            {Dimension.options.map((d) => (
              <th key={d} className="w-24 text-center text-xs font-medium text-muted">
                {t(`dimension.${d}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="pr-2">
                <Link
                  to="/b/suppliers/$tenantId"
                  params={{ tenantId: row.id }}
                  className="font-medium hover:text-accent"
                >
                  {row.name}
                </Link>
              </td>
              {Dimension.options.map((d) => {
                const level = row.dimensions?.[d]
                return (
                  <td
                    key={d}
                    className={cn(
                      'h-10 rounded-md text-center text-xs font-semibold tabular-nums',
                      level === undefined
                        ? 'bg-[repeating-linear-gradient(45deg,var(--gl-subtle),var(--gl-subtle)_4px,var(--gl-surface)_4px,var(--gl-surface)_8px)] font-normal text-muted'
                        : LADDER[level],
                      level !== undefined && level < 3 && 'text-heading',
                    )}
                  >
                    {level === undefined ? t('heatmap.notShared') : `L${level}`}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
