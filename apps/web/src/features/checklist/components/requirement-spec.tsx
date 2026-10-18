import type { CheckRequirement } from '@gembaleap/schemas'
import { Camera, Check, Ruler, ScanLine } from 'lucide-react'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'

export function decimalsOf(requirement: Extract<CheckRequirement, { kind: 'measurement' }>) {
  return requirement.decimals
}

/** "47.90–48.10 mm", "Photo", "Scan: heat number" — what the operator must provide. */
export function RequirementSpec({ requirement }: { requirement: CheckRequirement }) {
  const t = useT()
  const f = useFormat()
  switch (requirement.kind) {
    case 'measurement': {
      const digits = decimalsOf(requirement)
      return (
        <span className="inline-flex items-center gap-1">
          <Ruler className="size-3.5" aria-hidden />
          <span className="tabular-nums">
            {f.number(requirement.min, digits)}–{f.number(requirement.max, digits)}{' '}
            {requirement.unit}
          </span>
          <span aria-hidden>·</span>
          <Camera className="size-3.5" aria-hidden />
        </span>
      )
    }
    case 'photo':
      return (
        <span className="inline-flex items-center gap-1">
          <Camera className="size-3.5" aria-hidden />
          {t('check.req.photo')}
        </span>
      )
    case 'scan':
      return (
        <span className="inline-flex items-center gap-1">
          <ScanLine className="size-3.5" aria-hidden />
          {t(`check.req.scan.${requirement.field}`)}
        </span>
      )
    case 'confirm':
      return (
        <span className="inline-flex items-center gap-1">
          <Check className="size-3.5" aria-hidden />
          {t('check.req.confirm')}
        </span>
      )
  }
}
