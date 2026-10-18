import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { Camera, List } from 'lucide-react'
import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import { eventListQuery } from '../queries'
import { EventCards } from './event-cards'
import { EventFilters } from './event-filters'
import { EventsTable } from './events-table'

const route = getRouteApi('/s/events/')

export function EventsPage() {
  const t = useT()
  const search = route.useSearch()
  const { data } = useSuspenseQuery(eventListQuery(search))
  return (
    <>
      <PageHeader
        title={t('events.title')}
        meta={t('events.count', { count: data.rows.length })}
        actions={
          <Button asChild variant="primary">
            <Link to="/s/capture">
              <Camera aria-hidden />
              {t('nav.capture')}
            </Link>
          </Button>
        }
      />
      <EventFilters stages={data.stages} />
      {data.rows.length === 0 ? (
        <EmptyState icon={List} title={t('events.empty')} />
      ) : (
        <>
          <EventsTable rows={data.rows} timeZone={data.timeZone} />
          <EventCards rows={data.rows} timeZone={data.timeZone} />
        </>
      )}
    </>
  )
}
