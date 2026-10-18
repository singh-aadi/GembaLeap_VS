import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSignOut } from '@/features/session/hooks/use-sign-out'
import { useT } from '@/lib/i18n'
import type { Side } from '@/lib/roles'
import type { ShellSession } from './app-shell'

export function AccountPanel({ side, session }: { side: Side; session: ShellSession }) {
  const t = useT()
  const onSignOut = useSignOut()

  return (
    <div className="space-y-4">
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted">{t('shell.signedInAs')}</dt>
          <dd className="font-medium">{session.user.name}</dd>
          <dd className="text-muted">{session.user.title}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">
            {t(side === 'supplier' ? 'shell.supplierWorkspace' : 'shell.buyerWorkspace')}
          </dt>
          <dd className="font-medium">{session.tenant?.name}</dd>
          <dd className="text-muted">{session.tenant?.city}</dd>
        </div>
      </dl>
      <p className="text-xs text-muted">{t('shell.syntheticData')}</p>
      <Button variant="secondary" className="w-full" onClick={onSignOut}>
        <LogOut aria-hidden />
        {t('shell.signOut')}
      </Button>
    </div>
  )
}
