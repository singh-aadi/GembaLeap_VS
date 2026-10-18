import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Store } from 'lucide-react'
import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { Select } from '@/components/ui/field'
import { useT } from '@/lib/i18n'
import { sourcingQuery } from '../queries'
import { ProspectCard } from './prospect-card'

const route = getRouteApi('/b/sourcing')

/** New suppliers compete on evidence. Ordering is by depth of evidence, never a public score. */
export function SourcingPage() {
  const t = useT()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data } = useSuspenseQuery(sourcingQuery(search))
  return (
    <>
      <PageHeader title={t('nav.sourcing')} meta={t('sourcing.meta')} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Select
          aria-label={t('sourcing.process')}
          value={search.process ?? ''}
          onChange={(e) =>
            void navigate({
              search: (prev) => ({ ...prev, process: e.target.value || undefined }),
              replace: true,
            })
          }
          className="w-[calc(50%-4px)] sm:w-56"
        >
          <option value="">{t('sourcing.anyProcess')}</option>
          {data.processes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Select
          aria-label={t('sourcing.minLadder')}
          value={search.minLadder ?? ''}
          onChange={(e) =>
            void navigate({
              search: (prev) => ({
                ...prev,
                minLadder: e.target.value === '' ? undefined : Number(e.target.value),
              }),
              replace: true,
            })
          }
          className="w-[calc(50%-4px)] sm:w-44"
        >
          <option value="">{t('sourcing.anyLevel')}</option>
          {[1, 2, 3].map((l) => (
            <option key={l} value={l}>
              {t('sourcing.atLeast', { level: l })}
            </option>
          ))}
        </Select>
      </div>
      {data.rows.length === 0 ? (
        <EmptyState icon={Store} title={t('sourcing.none')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.rows.map((row) => (
            <ProspectCard key={row.tenant.id} row={row} certificates={data.certificates} />
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted">{t('sourcing.note')}</p>
    </>
  )
}
