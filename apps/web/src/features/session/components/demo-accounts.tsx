import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toastError } from '@/lib/errors'
import { useT } from '@/lib/i18n'
import { signInDemo } from '../api'
import { demoAccountsQuery, sessionKeys } from '../queries'

export function DemoAccounts() {
  const t = useT()
  const router = useRouter()
  const queryClient = useQueryClient()
  const signIn = useServerFn(signInDemo)
  const { data: accounts } = useSuspenseQuery(demoAccountsQuery())

  async function choose(userId: string) {
    try {
      const { home } = await signIn({ data: { userId } })
      // The session is read with ensureQueryData, so drop it rather than invalidate.
      queryClient.removeQueries({ queryKey: sessionKeys.current() })
      await router.navigate({ to: home })
    } catch (error) {
      toastError(t, error)
    }
  }

  const groups = [
    { side: 'supplier' as const, label: t('login.demo.suppliers') },
    { side: 'buyer' as const, label: t('login.demo.buyers') },
  ]

  return (
    <div className="mt-4 space-y-4">
      {groups.map((group) => (
        <div key={group.side}>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
            {group.label}
          </p>
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {accounts
              .filter((a) => a.side === group.side)
              .map((account) => (
                <li key={account.id}>
                  <button
                    type="button"
                    onClick={() => choose(account.id)}
                    className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-subtle"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                        {account.name}
                        <Badge tone={group.side === 'supplier' ? 'teal' : 'accent'}>
                          {t(`role.${account.role}`)}
                        </Badge>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {account.title} · {account.tenant}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
