import type { CheckRecord, ChecklistItem, Site, SlotStatus } from '@gembaleap/schemas'
import { evidenceRefs, now, type Db } from '@/lib/store.server'
import { zonedDate, zonedInstant } from '@/lib/time'

const DUE_WINDOW_MS = 30 * 60_000

export type SlotView = {
  slot: string
  dueAt: string
  status: SlotStatus
  record?: CheckRecord & { recordedByName: string }
}

/** Today's checklist for one site, with every slot's status derived from records and the clock. */
export function checklistState(store: Db, site: Site) {
  const at = now(store)
  const today = zonedDate(at, site.timeZone)
  const stages = store.stages.filter((s) => s.siteId === site.id).sort((a, b) => a.order - b.order)
  const records = store.checkRecords.filter((r) => r.siteId === site.id && r.shiftDate === today)

  const items = store.checklistItems
    .filter((i) => i.siteId === site.id)
    .map((item) => ({
      item,
      slots: item.slots.map((slot) =>
        slotView(store, item, slot, today, site.timeZone, at, records),
      ),
    }))

  const slots = items.flatMap((i) => i.slots)
  const summary = {
    scheduled: slots.length,
    dueSoFar: slots.filter((s) => s.status !== 'upcoming' || s.record).length,
    done: slots.filter((s) => s.record).length,
    outOfLimit: slots.filter((s) => s.status === 'out_of_limit').length,
    contained: slots.filter((s) => s.status === 'out_of_limit' && s.record?.containment).length,
    due: slots.filter((s) => s.status === 'due').length,
    overdue: slots.filter((s) => s.status === 'overdue').length,
    upcoming: slots.filter((s) => s.status === 'upcoming').length,
  }

  return {
    date: today,
    shift: 'A' as const,
    timeZone: site.timeZone,
    siteName: site.name,
    summary,
    stages: stages.map((stage) => {
      const stageItems = items.filter((i) => i.item.stageId === stage.id)
      const stageSlots = stageItems.flatMap((i) => i.slots)
      return {
        id: stage.id,
        name: stage.name,
        done: stageSlots.filter((s) => s.record).length,
        scheduled: stageSlots.length,
        items: stageItems,
      }
    }),
    evidence: evidenceRefs(
      store,
      records.flatMap((r) => r.evidenceIds),
    ),
  }
}

function slotView(
  store: Db,
  item: ChecklistItem,
  slot: string,
  date: string,
  timeZone: string,
  at: string,
  records: CheckRecord[],
): SlotView {
  const dueAt = zonedInstant(date, slot, timeZone)
  const record = records.find((r) => r.itemId === item.id && r.slot === slot)
  if (record) {
    const recordedByName = store.users.find((u) => u.id === record.recordedBy)?.name ?? ''
    return {
      slot,
      dueAt,
      status: record.result === 'pass' ? 'done' : 'out_of_limit',
      record: { ...record, recordedByName },
    }
  }
  const lateBy = Date.parse(at) - Date.parse(dueAt)
  const status: SlotStatus = lateBy < 0 ? 'upcoming' : lateBy <= DUE_WINDOW_MS ? 'due' : 'overdue'
  return { slot, dueAt, status }
}
