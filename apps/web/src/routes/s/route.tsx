import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/app/app-shell'
import { OutboxSync } from '@/features/capture/components/outbox-sync'
import { homeOf, sideOf } from '@/lib/roles'

export const Route = createFileRoute('/s')({
  beforeLoad: ({ context }) => {
    const { user, tenant, site } = context.session
    if (!user) throw redirect({ to: '/login' })
    if (sideOf(user.role) !== 'supplier' || !site) throw redirect({ to: homeOf(user.role) })
    return { shell: { user, tenant }, site }
  },
  component: SupplierLayout,
})

function SupplierLayout() {
  const { shell } = Route.useRouteContext()
  return (
    <AppShell side="supplier" session={shell}>
      <OutboxSync />
      <Outlet />
    </AppShell>
  )
}
