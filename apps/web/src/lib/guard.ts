import { redirect } from '@tanstack/react-router'
import type { getSession } from '@/features/session/api'
import { canOpen, homeOf, type Section } from './roles'

type Session = Awaited<ReturnType<typeof getSession>>

/** Route-level access check. UX only: every server function checks again. */
export function guard(section: Section) {
  return ({ context }: { context: { session: Session } }) => {
    const user = context.session.user
    if (!user) throw redirect({ to: '/login' })
    if (!canOpen(user.role, section)) throw redirect({ to: homeOf(user.role) })
  }
}
