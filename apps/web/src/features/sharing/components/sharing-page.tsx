import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { PageHeader } from '@/components/app/page-header'
import { useT } from '@/lib/i18n'
import { sharingQuery } from '../queries'
import { AccessLog } from './access-log'
import { ConsentList } from './consent-list'
import { GrantForm } from './grant-form'
import { OpenProfileCard } from './open-profile-card'

const root = getRouteApi('__root__')

export function SharingPage() {
  const t = useT()
  const { session } = root.useRouteContext()
  const { data } = useSuspenseQuery(sharingQuery())
  const defaultExpiry = new Date(Date.parse(session.clock) + 90 * 86_400_000)
    .toISOString()
    .slice(0, 10)
  return (
    <>
      <PageHeader title={t('nav.sharing')} meta={t('sharing.meta')} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <ConsentList consents={data.consents} clock={session.clock} />
          <OpenProfileCard enabled={data.openProfile} />
        </div>
        <div className="space-y-4">
          <GrantForm buyers={data.buyers} defaultExpiry={defaultExpiry} />
          <AccessLog log={data.log} timeZone={data.timeZone} />
        </div>
      </div>
    </>
  )
}
