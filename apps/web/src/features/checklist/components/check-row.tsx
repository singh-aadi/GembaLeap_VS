import { Button } from '@/components/ui/button'
import { EvidenceList } from '@/components/app/evidence-link'
import type { EvidenceMap } from '@/lib/evidence-ref'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import type { ChecklistEntry, ChecklistSlot } from '../queries'
import { decimalsOf, RequirementSpec } from './requirement-spec'
import { SlotStatusIcon, SlotStatusLabel } from './slot-status'

export function CheckRow({
  entry,
  slot,
  evidence,
  timeZone,
  onRecord,
}: {
  entry: ChecklistEntry
  slot: ChecklistSlot
  evidence: EvidenceMap
  timeZone: string
  onRecord: () => void
}) {
  const t = useT()
  const f = useFormat()
  const pick = useLocalized()
  const { item } = entry
  const record = slot.record
  const reading =
    record?.value !== undefined && item.requirement.kind === 'measurement'
      ? `${f.number(record.value, decimalsOf(item.requirement))} ${item.requirement.unit}`
      : record?.text

  return (
    <li className="flex gap-3 px-4 py-3">
      <SlotStatusIcon status={slot.status} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-medium text-ink">
            {pick(item.label)}
            {item.critical ? (
              <span className="ml-2 text-xs font-medium text-bad">{t('check.critical')}</span>
            ) : null}
          </p>
          <p className="text-xs text-muted tabular-nums">
            {slot.slot} · <SlotStatusLabel status={slot.status} />
          </p>
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <RequirementSpec requirement={item.requirement} />
          <span className="font-mono">{item.standardRef}</span>
        </p>
        {record ? (
          <div className="mt-2">
            <p className="text-xs text-muted">
              {reading ? (
                <span
                  className={
                    record.result === 'pass'
                      ? 'font-medium text-ink tabular-nums'
                      : 'font-semibold text-bad tabular-nums'
                  }
                >
                  {reading} ·{' '}
                </span>
              ) : null}
              {t('check.recordedBy', {
                name: record.recordedByName,
                time: f.time(record.recordedAt, timeZone),
              })}
            </p>
            {record.containment ? (
              <p className="mt-2 rounded-md border-l-2 border-bad bg-bad-soft px-3 py-2 text-xs text-ink">
                <span className="font-medium">{t('check.containment')}: </span>
                {record.containment}
              </p>
            ) : null}
            <EvidenceList ids={record.evidenceIds} evidence={evidence} timeZone={timeZone} />
          </div>
        ) : (
          <Button className="mt-2" onClick={onRecord}>
            {t('check.record')}
          </Button>
        )}
      </div>
    </li>
  )
}
