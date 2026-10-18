import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import { checklistQuery, type ChecklistEntry } from '../queries'
import { CheckRow } from './check-row'
import { ChecklistSummary } from './checklist-summary'
import { RecordCheckSheet } from './record-check-sheet'

const route = getRouteApi('/s/checklist')

export function ChecklistPage() {
  const t = useT()
  const f = useFormat()
  const pick = useLocalized()
  const { stage: stageFilter } = route.useSearch()
  const navigate = route.useNavigate()
  const { data } = useSuspenseQuery(checklistQuery())
  const [target, setTarget] = useState<{ entry: ChecklistEntry; slot: string } | null>(null)

  const stages = data.stages.filter((s) => !stageFilter || s.id === stageFilter)

  return (
    <>
      <PageHeader
        title={t('checklist.title')}
        meta={t('checklist.meta', {
          shift: data.shift,
          date: f.day(data.date),
          site: data.siteName,
        })}
      />
      <Card className="p-4">
        <ChecklistSummary summary={data.summary} />
        <p className="mt-3 border-t border-line pt-3 text-xs text-muted">{t('checklist.rule')}</p>
      </Card>

      <nav
        aria-label={t('checklist.stages')}
        className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {[
          { id: undefined, label: t('checklist.allStages') },
          ...data.stages.map((s) => ({
            id: s.id,
            label: `${pick(s.name)} · ${s.done}/${s.scheduled}`,
          })),
        ].map((chip) => (
          <button
            key={chip.id ?? 'all'}
            type="button"
            aria-pressed={stageFilter === chip.id}
            onClick={() => void navigate({ search: { stage: chip.id }, replace: true })}
            className={cn(
              'inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-sm',
              stageFilter === chip.id
                ? 'border-accent bg-accent-soft font-medium text-accent'
                : 'border-line bg-surface',
            )}
          >
            {chip.label}
          </button>
        ))}
      </nav>

      <div className="mt-4 space-y-4">
        {stages.map((stage) => (
          <Card key={stage.id}>
            <CardHeader
              title={pick(stage.name)}
              action={
                <span className="text-xs text-muted tabular-nums">
                  {stage.done}/{stage.scheduled}
                </span>
              }
            />
            <ul className="divide-y divide-line">
              {stage.items.flatMap((entry) =>
                entry.slots.map((slot) => (
                  <CheckRow
                    key={`${entry.item.id}-${slot.slot}`}
                    entry={entry}
                    slot={slot}
                    evidence={data.evidence}
                    timeZone={data.timeZone}
                    onRecord={() => setTarget({ entry, slot: slot.slot })}
                  />
                )),
              )}
            </ul>
          </Card>
        ))}
      </div>
      <RecordCheckSheet target={target} onClose={() => setTarget(null)} />
    </>
  )
}
