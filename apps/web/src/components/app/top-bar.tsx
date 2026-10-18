import type { Side } from '@/lib/roles'
import type { ShellSession } from './app-shell'
import { Brand } from './brand'
import { LanguageSwitcher } from './language-switcher'
import { OfflineIndicator } from './offline-indicator'
import { UserMenu } from './user-menu'

/** Phone and tablet app bar. On desktop only the offline state shows, in the content area. */
export function TopBar({ side, session }: { side: Side; session: ShellSession }) {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-navy pr-1 pl-4 text-on-navy lg:hidden">
        <div className="min-w-0 flex-1">
          <Brand className="hidden text-sm sm:inline" />
          <p className="truncate text-sm font-medium sm:hidden">{session.tenant?.name}</p>
        </div>
        <OfflineIndicator tone="navy" />
        <LanguageSwitcher tone="navy" />
        <UserMenu side={side} session={session} />
      </header>
      <div className="hidden justify-end px-8 pt-4 lg:flex">
        <OfflineIndicator tone="light" />
      </div>
    </>
  )
}
