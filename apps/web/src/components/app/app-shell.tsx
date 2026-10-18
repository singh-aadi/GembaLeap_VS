import type { Role } from '@gembaleap/schemas'
import type { ReactNode } from 'react'
import { mobileTabsFor, navFor } from '@/lib/nav'
import type { Side } from '@/lib/roles'
import { BottomNav } from './bottom-nav'
import { SideNav } from './side-nav'
import { TopBar } from './top-bar'

export type ShellSession = {
  user: { id: string; name: string; title: string; role: Role }
  tenant: { name: string; city: string } | null
}

/** Sidebar from 1024 px; app bar and bottom tabs below that. */
export function AppShell({
  side,
  session,
  children,
}: {
  side: Side
  session: ShellSession
  children: ReactNode
}) {
  const groups = navFor(session.user.role, side)
  const { tabs, overflow } = mobileTabsFor(session.user.role, side)
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <SideNav side={side} session={session} groups={groups} />
      <div className="flex min-w-0 flex-col">
        <TopBar side={side} session={session} />
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-4 pb-28 lg:px-8 lg:pt-6 lg:pb-12">
          {children}
        </main>
      </div>
      <BottomNav tabs={tabs} overflow={overflow} />
    </div>
  )
}
