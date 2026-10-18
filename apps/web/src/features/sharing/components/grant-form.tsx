import { ConsentScope } from '@gembaleap/schemas'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Input, Label, Select } from '@/components/ui/field'
import { toastError } from '@/lib/errors'
import { useT } from '@/lib/i18n'
import { grantConsent } from '../api'
import { sharingKeys, type Sharing } from '../queries'

export function GrantForm({
  buyers,
  defaultExpiry,
}: {
  buyers: Sharing['buyers']
  defaultExpiry: string
}) {
  const t = useT()
  const queryClient = useQueryClient()
  const grant = useServerFn(grantConsent)
  const form = useForm({
    defaultValues: {
      buyerTenantId: buyers[0]?.id ?? '',
      scope: ['passports', 'reports'] as ConsentScope[],
      expiresAt: defaultExpiry,
    },
    onSubmit: async ({ value }) => {
      try {
        await grant({ data: value })
        toast.success(t('sharing.granted'))
        await queryClient.invalidateQueries({ queryKey: sharingKeys.all })
      } catch (error) {
        toastError(t, error)
      }
    },
  })

  return (
    <Card>
      <CardHeader title={t('sharing.grant')} description={t('sharing.grantHint')} />
      <CardBody>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field name="buyerTenantId">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>{t('sharing.buyer')}</Label>
                <Select
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  {buyers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </form.Field>
          <form.Field name="scope">
            {(field) => (
              <fieldset className="min-w-0">
                <legend className="mb-1 text-xs font-medium text-muted">
                  {t('sharing.scope')}
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {ConsentScope.options.map((scope) => {
                    const checked = field.state.value.includes(scope)
                    return (
                      <label
                        key={scope}
                        className="flex h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-[var(--gl-accent)]"
                          checked={checked}
                          onChange={() =>
                            field.handleChange(
                              checked
                                ? field.state.value.filter((s) => s !== scope)
                                : [...field.state.value, scope],
                            )
                          }
                        />
                        {t(`scope.${scope}`)}
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            )}
          </form.Field>
          <form.Field name="expiresAt">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>{t('sharing.until')}</Label>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="sm:max-w-48"
                />
              </div>
            )}
          </form.Field>
          <form.Subscribe selector={(s) => [s.isSubmitting, s.values.scope.length] as const}>
            {([submitting, scopes]) => (
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={submitting || scopes === 0}
              >
                {t('sharing.grantAction')}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardBody>
    </Card>
  )
}
