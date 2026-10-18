import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { EvidenceList } from '@/components/app/evidence-link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/field'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { postNcrMessage } from '../api'
import { ncrKeys, type NcrView } from '../queries'

/** One thread both companies write in, so the 8D is argued on the same record. */
export function NcrThread({ data }: { data: NcrView }) {
  const t = useT()
  const f = useFormat()
  const queryClient = useQueryClient()
  const post = useServerFn(postNcrMessage)
  const [text, setText] = useState('')
  const mutation = useMutation({
    mutationFn: () => post({ data: { ncrId: data.ncr.id, text } }),
    onSuccess: () => {
      setText('')
      void queryClient.invalidateQueries({ queryKey: ncrKeys.detail(data.ncr.id) })
    },
    onError: (error) => toastError(t, error),
  })
  return (
    <Card>
      <CardHeader
        title={t('ncr.thread')}
        description={t('ncr.threadHint', { buyer: data.buyerName, supplier: data.supplierName })}
      />
      <ol className="divide-y divide-line">
        {data.thread.map((message) => (
          <li key={message.id} className="px-4 py-3">
            <p className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-ink">{message.authorName}</span>
              <Badge tone={message.authorSide === 'buyer' ? 'accent' : 'teal'}>
                {message.authorSide === 'buyer' ? data.buyerName : data.supplierName}
              </Badge>
              <span className="text-muted tabular-nums">
                {f.dateTime(message.at, data.timeZone)}
              </span>
            </p>
            <p className="mt-1 text-sm">{message.text}</p>
            {message.evidenceIds.length > 0 ? (
              <EvidenceList
                ids={message.evidenceIds}
                evidence={data.evidence}
                timeZone={data.timeZone}
              />
            ) : null}
          </li>
        ))}
      </ol>
      <form
        className="border-t border-line p-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) mutation.mutate()
        }}
      >
        <Textarea
          aria-label={t('ncr.reply')}
          placeholder={t('ncr.reply')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
        />
        <Button type="submit" className="mt-2" disabled={!text.trim() || mutation.isPending}>
          {t('ncr.send')}
        </Button>
      </form>
    </Card>
  )
}
