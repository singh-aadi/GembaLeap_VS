import { Brand } from '@/components/app/brand'
import { LanguageSwitcher } from '@/components/app/language-switcher'
import { useT } from '@/lib/i18n'
import { DemoAccounts } from './demo-accounts'
import { SignInForm } from './sign-in-form'

export function LoginPage() {
  const t = useT()
  return (
    <div className="min-h-dvh bg-subtle">
      <header className="flex h-14 items-center justify-between bg-navy pr-1 pl-4 text-on-navy sm:px-6">
        <Brand className="text-sm" />
        <LanguageSwitcher tone="navy" />
      </header>
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:py-10 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
        <section>
          <h1 className="text-xl">{t('login.title')}</h1>
          <p className="mt-2 text-sm text-muted">{t('login.subtitle')}</p>
          <SignInForm />
        </section>
        <section>
          <h2 className="text-base">{t('login.demo.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('login.demo.body')}</p>
          <DemoAccounts />
        </section>
      </main>
    </div>
  )
}
