import { createFileRoute, redirect } from '@tanstack/react-router'
import { homeOf } from '@/lib/roles'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    const user = context.session.user
    throw redirect({ to: user ? homeOf(user.role) : '/login' })
  },
})
