import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Cpu } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toastError } from '@/lib/errors'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { toggleSkill } from '../api'
import { skillKeys, skillsQuery, type SkillRow } from '../queries'

/** Micro-AI skill library: one small job, one metric, switch off without breaking the flow. */
export function SkillsPage() {
  const t = useT()
  const f = useFormat()
  const queryClient = useQueryClient()
  const toggle = useServerFn(toggleSkill)
  const { data } = useSuspenseQuery(skillsQuery())
  const mutation = useMutation({
    mutationFn: (row: { skill: SkillRow['key']; enabled: boolean }) => toggle({ data: row }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: skillKeys.all }),
    onError: (error) => toastError(t, error),
  })
  const on = data.filter((s) => s.enabled).length
  const value = (row: SkillRow) =>
    row.measured === undefined
      ? '—'
      : row.unit === 'percent'
        ? f.percent(row.measured / 100, 1)
        : `${f.number(row.measured)} ${t(`skill.unit.${row.unit}`)}`

  return (
    <>
      <PageHeader title={t('nav.skills')} meta={t('skills.meta', { on, total: data.length })} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.map((row) => (
          <Card key={row.key} className="flex flex-col p-4">
            <div className="flex items-start gap-3">
              <Cpu className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{t(`skill.${row.key}.name`)}</p>
                <p className="mt-0.5 text-xs text-muted">{t(`skill.${row.key}.io`)}</p>
              </div>
              <Switch
                checked={
                  mutation.isPending && mutation.variables.skill === row.key
                    ? mutation.variables.enabled
                    : row.enabled
                }
                onCheckedChange={(enabled) => mutation.mutate({ skill: row.key, enabled })}
                aria-label={t(`skill.${row.key}.name`)}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="outline">{t(`skill.tier.${row.tier}`)}</Badge>
              {row.unlocks > 0 ? (
                <Badge>{t('skills.unlocks', { level: row.unlocks })}</Badge>
              ) : null}
              {row.recommendedAt ? (
                <Badge tone="teal">{t('skills.atStep', { step: row.recommendedAt })}</Badge>
              ) : null}
            </div>
            <dl className="mt-auto grid grid-cols-2 gap-2 pt-4 text-sm">
              <div>
                <dt className="text-xs text-muted">{row.metric}</dt>
                <dd className="font-semibold text-heading tabular-nums">{value(row)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{t('skills.runs')}</dt>
                <dd className="font-semibold text-heading tabular-nums">{row.runs30d}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">{t('skills.rule')}</p>
    </>
  )
}
