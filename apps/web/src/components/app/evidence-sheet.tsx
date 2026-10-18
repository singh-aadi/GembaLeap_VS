import { Fingerprint } from 'lucide-react'
import { Sheet } from '@/components/ui/sheet'
import type { EvidenceRef } from '@/lib/evidence-ref'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { EVIDENCE_ICON } from './evidence-link'

export function EvidenceSheet({
  evidence,
  open,
  onOpenChange,
  timeZone,
}: {
  evidence: EvidenceRef
  open: boolean
  onOpenChange: (open: boolean) => void
  timeZone?: string
}) {
  const t = useT()
  const f = useFormat()
  const Icon = EVIDENCE_ICON[evidence.kind]
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={evidence.caption}
      description={`${t(`evidence.kind.${evidence.kind}`)} · ${f.dateTime(evidence.at, timeZone)}`}
      closeLabel={t('common.close')}
    >
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-subtle text-muted">
        <Icon className="size-8" aria-hidden />
        <p className="max-w-60 text-center text-xs">{t('evidence.synthetic')}</p>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted">{t('evidence.id')}</dt>
          <dd className="font-mono text-xs break-all">{evidence.id}</dd>
        </div>
        {evidence.sha256 ? (
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted">
              <Fingerprint className="size-3.5" aria-hidden />
              {t('evidence.sha256')}
            </dt>
            <dd className="font-mono text-xs break-all">{evidence.sha256}</dd>
            <dd className="mt-1 text-xs text-muted">{t('evidence.hashNote')}</dd>
          </div>
        ) : null}
      </dl>
    </Sheet>
  )
}
