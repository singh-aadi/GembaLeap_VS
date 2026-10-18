import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/features/session/components/login-page'
import { demoAccountsQuery } from '@/features/session/queries'
import { homeOf } from '@/lib/roles'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    const user = context.session.user
    if (user) throw redirect({ to: homeOf(user.role) })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(demoAccountsQuery()),
  component: LoginPage,
})
