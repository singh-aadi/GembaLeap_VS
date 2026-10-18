import { useState } from 'react'
import { Sheet } from '@/components/ui/sheet'
import { useT } from '@/lib/i18n'
import type { Side } from '@/lib/roles'
import type { ShellSession } from './app-shell'
import { AccountPanel } from './account-panel'

export function UserMenu({ side, session }: { side: Side; session: ShellSession }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const initials = session.user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-white/10"
      >
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
          {initials}
        </span>
        <span className="sr-only">{t('shell.account')}</span>
      </button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={t('shell.account')}
        closeLabel={t('common.close')}
      >
        <AccountPanel side={side} session={session} />
      </Sheet>
    </>
  )
}
