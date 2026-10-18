import { Locale } from '@gembaleap/schemas'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useRouteContext } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Check, Languages } from 'lucide-react'
import { useState } from 'react'
import { Sheet } from '@/components/ui/sheet'
import { setLocale } from '@/features/session/api'
import { sessionKeys } from '@/features/session/queries'
import { cn } from '@/lib/cn'
import { LOCALE_NAMES, useT } from '@/lib/i18n'

export function LanguageSwitcher({ tone }: { tone: 'navy' | 'light' }) {
  const t = useT()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { session } = useRouteContext({ from: '__root__' })
  const setLocaleFn = useServerFn(setLocale)
  const [open, setOpen] = useState(false)

  async function choose(locale: Locale) {
    await setLocaleFn({ data: { locale } })
    queryClient.removeQueries({ queryKey: sessionKeys.current() })
    await router.invalidate()
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex h-11 items-center gap-1 rounded-lg px-2 text-xs font-semibold uppercase',
          tone === 'navy'
            ? 'text-on-navy-muted hover:bg-white/10 hover:text-on-navy'
            : 'text-muted hover:bg-subtle',
        )}
      >
        <Languages className="size-4" aria-hidden />
        {session.locale}
        <span className="sr-only">{t('shell.language')}</span>
      </button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={t('shell.language')}
        closeLabel={t('common.close')}
      >
        <ul className="-mx-2">
          {Locale.options.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                lang={locale}
                onClick={() => choose(locale)}
                className="flex h-12 w-full items-center justify-between rounded-lg px-2 text-left text-sm hover:bg-subtle"
              >
                {LOCALE_NAMES[locale]}
                {locale === session.locale ? (
                  <Check className="size-4 text-accent" aria-hidden />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  )
}
