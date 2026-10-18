import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/app/app-shell'
import { homeOf, sideOf } from '@/lib/roles'

export const Route = createFileRoute('/b')({
  beforeLoad: ({ context }) => {
    const { user, tenant } = context.session
    if (!user) throw redirect({ to: '/login' })
    if (sideOf(user.role) !== 'buyer') throw redirect({ to: homeOf(user.role) })
    return { shell: { user, tenant } }
  },
  component: BuyerLayout,
})

function BuyerLayout() {
  const { shell } = Route.useRouteContext()
  return (
    <AppShell side="buyer" session={shell}>
      <Outlet />
    </AppShell>
  )
}
