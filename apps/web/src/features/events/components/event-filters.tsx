import { EventType } from '@gembaleap/schemas'
import { getRouteApi } from '@tanstack/react-router'
import { Select } from '@/components/ui/field'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import type { LocalizedText } from '@gembaleap/schemas'

const route = getRouteApi('/s/events/')

/** Filters live in the URL so a filtered list can be shared and survives reloads. */
export function EventFilters({ stages }: { stages: Array<{ id: string; name: LocalizedText }> }) {
  const t = useT()
  const pick = useLocalized()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const set = (patch: Partial<typeof search>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      <Select
        aria-label={t('events.filter.stage')}
        value={search.stage ?? ''}
        onChange={(e) => set({ stage: e.target.value || undefined })}
        className="sm:w-56"
      >
        <option value="">{t('events.filter.allStages')}</option>
        {stages.map((s) => (
          <option key={s.id} value={s.id}>
            {pick(s.name)}
          </option>
        ))}
      </Select>
      <Select
        aria-label={t('events.filter.type')}
        value={search.type ?? ''}
        onChange={(e) => {
          const parsed = EventType.safeParse(e.target.value)
          set({ type: parsed.success ? parsed.data : undefined })
        }}
        className="sm:w-44"
      >
        <option value="">{t('events.filter.allTypes')}</option>
        {EventType.options.map((type) => (
          <option key={type} value={type}>
            {t(`eventType.${type}`)}
          </option>
        ))}
      </Select>
      <Select
        aria-label={t('events.filter.status')}
        value={search.status ?? ''}
        onChange={(e) =>
          set({
            status:
              e.target.value === 'draft' || e.target.value === 'confirmed'
                ? e.target.value
                : undefined,
          })
        }
        className="sm:w-44"
      >
        <option value="">{t('events.filter.anyStatus')}</option>
        <option value="draft">{t('event.status.draft')}</option>
        <option value="confirmed">{t('event.status.confirmed')}</option>
      </Select>
      <Select
        aria-label={t('events.filter.sort')}
        value={search.sort}
        onChange={(e) => set({ sort: e.target.value === 'severity' ? 'severity' : 'time' })}
        className="sm:w-44"
      >
        <option value="time">{t('events.sort.time')}</option>
        <option value="severity">{t('events.sort.severity')}</option>
      </Select>
    </div>
  )
}
