import { Sector } from '@gembaleap/schemas'
import { getRouteApi } from '@tanstack/react-router'
import { LayoutGrid, Table2 } from 'lucide-react'
import { Select } from '@/components/ui/field'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'

const route = getRouteApi('/b/suppliers/')

export function HeatmapFilters({ sectors }: { sectors: Sector[] }) {
  const t = useT()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const set = (patch: Partial<typeof search>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Select
        aria-label={t('heatmap.sector')}
        value={search.sector ?? ''}
        onChange={(e) => set({ sector: Sector.safeParse(e.target.value).data })}
        className="w-[calc(50%-4px)] sm:w-44"
      >
        <option value="">{t('heatmap.allSectors')}</option>
        {sectors.map((s) => (
          <option key={s} value={s}>
            {t(`sector.${s}`)}
          </option>
        ))}
      </Select>
      <Select
        aria-label={t('heatmap.drift')}
        value={search.drift ?? ''}
        onChange={(e) =>
          set({
            drift:
              e.target.value === 'improving' ||
              e.target.value === 'stable' ||
              e.target.value === 'drifting'
                ? e.target.value
                : undefined,
          })
        }
        className="w-[calc(50%-4px)] sm:w-44"
      >
        <option value="">{t('heatmap.anyTrend')}</option>
        <option value="drifting">{t('drift.drifting')}</option>
        <option value="stable">{t('drift.stable')}</option>
        <option value="improving">{t('drift.improving')}</option>
      </Select>
      <Select
        aria-label={t('heatmap.sort')}
        value={search.sort}
        onChange={(e) =>
          set({
            sort:
              e.target.value === 'ladder' ||
              e.target.value === 'adherence' ||
              e.target.value === 'name'
                ? e.target.value
                : 'risk',
          })
        }
        className="w-[calc(50%-4px)] sm:w-56"
      >
        <option value="risk">{t('heatmap.sort.risk')}</option>
        <option value="ladder">{t('heatmap.sort.ladder')}</option>
        <option value="adherence">{t('heatmap.sort.adherence')}</option>
        <option value="name">{t('heatmap.sort.name')}</option>
      </Select>
      <div
        role="group"
        aria-label={t('heatmap.view')}
        className="ml-auto inline-flex rounded-lg border border-line bg-surface p-0.5"
      >
        {(['table', 'grid'] as const).map((view) => {
          const Icon = view === 'table' ? Table2 : LayoutGrid
          return (
            <button
              key={view}
              type="button"
              aria-pressed={search.view === view}
              onClick={() => set({ view })}
              className={cn(
                'inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm',
                search.view === view ? 'bg-accent-soft font-medium text-accent' : 'text-muted',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {t(`heatmap.view.${view}`)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
