import { LogOut } from 'lucide-react'
import { useSignOut } from '@/features/session/hooks/use-sign-out'
import { useT } from '@/lib/i18n'
import type { ShellSession } from './app-shell'
import { LanguageSwitcher } from './language-switcher'

export function UserBlock({ session }: { session: ShellSession }) {
  const t = useT()
  const onSignOut = useSignOut()

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1 px-2">
        <p className="truncate text-sm font-medium">{session.user.name}</p>
        <p className="truncate text-xs text-on-navy-muted">{t(`role.${session.user.role}`)}</p>
      </div>
      <LanguageSwitcher tone="navy" />
      <button
        type="button"
        onClick={onSignOut}
        className="inline-flex size-11 items-center justify-center rounded-lg text-on-navy-muted hover:bg-white/10 hover:text-on-navy"
      >
        <LogOut className="size-4" aria-hidden />
        <span className="sr-only">{t('shell.signOut')}</span>
      </button>
    </div>
  )
}
