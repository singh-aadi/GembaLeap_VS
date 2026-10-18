import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { MessageCircleQuestion, SendHorizontal } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@/components/app/empty-state'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, Textarea } from '@/components/ui/field'
import { toastError } from '@/lib/errors'
import { useT, type MessageId } from '@/lib/i18n'
import { askEvidence } from '../api'
import { askScopeQuery } from '../queries'
import { AnswerCard, type Exchange } from './answer-card'

const SUGGESTIONS: MessageId[] = [
  'ask.suggest.ool',
  'ask.suggest.containment',
  'ask.suggest.heat',
  'ask.suggest.ftr',
]

/** Ask questions of the evidence. Buyers search only what a live consent covers. */
export function AskPage({
  supplier,
  onSupplierChange,
}: {
  supplier?: string
  onSupplierChange?: (id: string | undefined) => void
}) {
  const t = useT()
  const ask = useServerFn(askEvidence)
  const { data: scope } = useSuspenseQuery(askScopeQuery())
  const [question, setQuestion] = useState('')
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const supplierTenantId = scope.isBuyer ? (supplier ?? scope.suppliers[0]?.id) : undefined

  const mutation = useMutation({
    mutationFn: (q: string) => ask({ data: { question: q, supplierTenantId } }),
    onSuccess: (result) => {
      setExchanges((prev) => [...prev, result])
      setQuestion('')
    },
    onError: (error) => toastError(t, error),
  })

  const submit = (q: string) => {
    if (q.trim().length >= 3) mutation.mutate(q.trim())
  }

  return (
    <>
      <PageHeader
        title={t('nav.ask')}
        meta={t(scope.isBuyer ? 'ask.hint.buyer' : 'ask.hint.supplier')}
      />
      {scope.isBuyer ? (
        <Select
          aria-label={t('ask.supplier')}
          value={supplierTenantId ?? ''}
          onChange={(e) => {
            setExchanges([])
            onSupplierChange?.(e.target.value || undefined)
          }}
          className="mb-4 sm:w-80"
        >
          {scope.suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.scope.map((x) => t(`scope.${x}`)).join(', ')}
            </option>
          ))}
        </Select>
      ) : null}

      <div className="space-y-4 pb-36 lg:pb-0">
        {exchanges.length === 0 ? (
          <Card>
            <EmptyState
              icon={MessageCircleQuestion}
              title={t('ask.empty')}
              body={t('ask.emptyBody')}
            />
            <ul className="flex flex-wrap justify-center gap-2 px-4 pb-6">
              {SUGGESTIONS.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => submit(t(id))}
                    className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-left text-sm hover:border-accent hover:text-accent"
                  >
                    {t(id)}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          exchanges.map((exchange) => <AnswerCard key={exchange.answer.id} exchange={exchange} />)
        )}
      </div>

      <form
        className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-surface p-3 lg:static lg:mt-4 lg:rounded-lg lg:border"
        onSubmit={(e) => {
          e.preventDefault()
          submit(question)
        }}
      >
        <div className="mx-auto flex max-w-[1200px] items-end gap-2">
          <Textarea
            aria-label={t('ask.placeholder')}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('ask.placeholder')}
            rows={1}
            className="min-h-11 flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit(question)
              }
            }}
          />
          <Button
            type="submit"
            variant="primary"
            size="icon"
            disabled={mutation.isPending || question.trim().length < 3}
          >
            <SendHorizontal aria-hidden />
            <span className="sr-only">{t('ask.send')}</span>
          </Button>
        </div>
      </form>
    </>
  )
}
