import { Link } from '@tanstack/react-router'
import { useT } from '@/lib/i18n'
import type { NavGroup } from '@/lib/nav'
import type { Side } from '@/lib/roles'
import type { ShellSession } from './app-shell'
import { Brand } from './brand'
import { DemoDataNote } from './demo-data-note'
import { UserBlock } from './user-block'

export function SideNav({
  side,
  session,
  groups,
}: {
  side: Side
  session: ShellSession
  groups: NavGroup[]
}) {
  const t = useT()
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col bg-navy text-on-navy lg:flex">
      <div className="border-b border-white/10 px-5 pt-5 pb-4">
        <Brand className="text-base" />
        <p className="mt-4 truncate text-sm font-medium">{session.tenant?.name}</p>
        <p className="text-xs text-on-navy-muted">
          {t(side === 'supplier' ? 'shell.supplierWorkspace' : 'shell.buyerWorkspace')} ·{' '}
          {session.tenant?.city}
        </p>
      </div>
      <nav aria-label={t('shell.mainNav')} className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1 px-2 text-xs font-medium tracking-wide text-on-navy-muted uppercase">
              {t(group.label)}
            </p>
            <ul>
              {group.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex h-10 items-center gap-3 rounded-lg px-2 text-sm text-on-navy/85 hover:bg-white/8 hover:text-on-navy"
                    activeProps={{ className: 'bg-white/12 font-medium text-on-navy' }}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden />
                    {t(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <UserBlock session={session} />
        <DemoDataNote className="mt-3 px-2" />
      </div>
    </aside>
  )
}
