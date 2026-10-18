import { useForm } from '@tanstack/react-form'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toastError } from '@/lib/errors'
import { useT } from '@/lib/i18n'
import { requestSignInCode } from '../api'

type Method = 'phone' | 'email'

/** Phone OTP for line staff, email for buyers. Both go to Identity Platform once it is connected. */
export function SignInForm() {
  const t = useT()
  const request = useServerFn(requestSignInCode)
  const [method, setMethod] = useState<Method>('phone')
  const form = useForm({
    defaultValues: { phone: '', email: '' },
    onSubmit: async ({ value }) => {
      try {
        await request({
          data:
            method === 'phone' ? { method, phone: value.phone } : { method, email: value.email },
        })
      } catch (error) {
        toastError(t, error)
      }
    },
  })

  return (
    <Card className="mt-6 p-4">
      <Tabs
        value={method}
        onValueChange={(value) => setMethod(value === 'email' ? 'email' : 'phone')}
      >
        <TabsList>
          <TabsTrigger value="phone">{t('login.phone')}</TabsTrigger>
          <TabsTrigger value="email">{t('login.email')}</TabsTrigger>
        </TabsList>
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <TabsContent value="phone">
            <form.Field name="phone">
              {(field) => (
                <>
                  <Label htmlFor={field.name}>{t('login.phone.label')}</Label>
                  <Input
                    id={field.name}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+81 90 1234 5678"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-muted">{t('login.phone.hint')}</p>
                </>
              )}
            </form.Field>
          </TabsContent>
          <TabsContent value="email">
            <form.Field name="email">
              {(field) => (
                <>
                  <Label htmlFor={field.name}>{t('login.email.label')}</Label>
                  <Input
                    id={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-muted">{t('login.email.hint')}</p>
                </>
              )}
            </form.Field>
          </TabsContent>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(submitting) => (
              <Button type="submit" variant="primary" className="mt-4 w-full" disabled={submitting}>
                {t(method === 'phone' ? 'login.sendCode' : 'login.sendLink')}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Tabs>
    </Card>
  )
}
