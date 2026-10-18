import { Card, CardHeader } from '@/components/ui/card'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { Sharing } from '../queries'

/** The tail of the audit chain for this supplier: who looked at what, and what was sealed. */
export function AccessLog({ log, timeZone }: { log: Sharing['log']; timeZone: string }) {
  const t = useT()
  const f = useFormat()
  return (
    <Card>
      <CardHeader title={t('sharing.log')} description={t('sharing.logHint')} />
      <ol className="divide-y divide-line">
        {log.map((entry) => (
          <li key={entry.seq} className="grid grid-cols-[auto_1fr] gap-x-3 px-4 py-2.5 text-sm">
            <span className="font-mono text-xs text-muted tabular-nums">#{entry.seq}</span>
            <div className="min-w-0">
              <p>
                <span className="font-medium">{entry.actor}</span> · {t(`audit.${entry.action}`)}
              </p>
              <p className="truncate text-xs text-muted">
                <span className="tabular-nums">{f.dateTime(entry.at, timeZone)}</span> ·{' '}
                <span className="font-mono">{entry.hash.slice(0, 12)}…</span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
