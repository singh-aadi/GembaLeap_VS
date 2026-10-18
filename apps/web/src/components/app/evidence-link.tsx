import { FileText, Image, List, Mic, ScanLine, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { EvidenceRef } from '@/lib/evidence-ref'
import { shortId } from '@/lib/format'
import { EvidenceSheet } from './evidence-sheet'

export const EVIDENCE_ICON: Record<EvidenceRef['kind'], LucideIcon> = {
  photo: Image,
  audio: Mic,
  scan: ScanLine,
  file: FileText,
  event: List,
}

/** Compact citation chip. Opens the evidence in a sheet. */
export function EvidenceLink({
  evidence,
  timeZone,
}: {
  evidence: EvidenceRef | undefined
  timeZone?: string
}) {
  const [open, setOpen] = useState(false)
  if (!evidence) return null
  const Icon = EVIDENCE_ICON[evidence.kind]
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-md border border-line bg-surface px-2 text-xs text-ink hover:border-accent hover:text-accent"
      >
        <Icon className="size-3.5 shrink-0 text-muted" aria-hidden />
        <span className="truncate">{evidence.caption}</span>
        <span className="shrink-0 font-mono text-[11px] text-muted">{shortId(evidence.id)}</span>
      </button>
      <EvidenceSheet evidence={evidence} open={open} onOpenChange={setOpen} timeZone={timeZone} />
    </>
  )
}

export function EvidenceList({
  ids,
  evidence,
  timeZone,
}: {
  ids: readonly string[]
  evidence: Record<string, EvidenceRef>
  timeZone?: string
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <EvidenceLink key={id} evidence={evidence[id]} timeZone={timeZone} />
      ))}
    </div>
  )
}
