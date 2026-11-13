import { ArrowRight, Droplets } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { useT } from '@/lib/i18n'
import type { CoachPlant } from '../queries'

type Map = NonNullable<CoachPlant['current']>

/** Current flow beside the redesigned one. Each leak point carries the skill that closes it. */
export function ProcessMapView({
  current,
  future,
  skills,
  onSwitchOn,
  pending,
}: {
  current: Map | undefined
  future: Map | undefined
  skills: CoachPlant['skills']
  onSwitchOn: (skill: CoachPlant['skills'][number]['key']) => void
  pending: boolean
}) {
  const t = useT()
  if (!current) return <p className="text-sm text-muted">{t('coach.noMap')}</p>
  return (
    <Card>
      <CardHeader
        title={t('coach.map')}
        description={t(`coach.mapStatus.${future?.status ?? current.status}`)}
      />
      <ol className="divide-y divide-line">
        {current.steps.map((step) => {
          const next = future?.steps.find((s) => s.id === step.id)
          const skill = skills.find((s) => s.key === next?.leak?.skill)
          return (
            <li key={step.id} className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_auto_1fr]">
              <div>
                <p className="text-sm font-medium">{step.name}</p>
                <p className="text-xs text-muted">
                  {step.owner} · {step.checks.join(', ') || '—'}
                </p>
                {step.leak ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-bad">
                    <Droplets className="size-3.5" aria-hidden />
                    {step.leak.description}
                  </p>
                ) : null}
              </div>
              <ArrowRight className="hidden size-4 self-center text-muted md:block" aria-hidden />
              <div>
                {next ? (
                  <>
                    <p className="text-xs text-muted">{next.checks.join(' · ')}</p>
                    {skill ? (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge tone="teal">{t(`skill.${skill.key}.name`)}</Badge>
                        {skill.enabled ? (
                          <Badge tone="good">{t('coach.on')}</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => onSwitchOn(skill.key)}
                            disabled={pending}
                          >
                            {t('coach.switchOn')}
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="text-xs text-muted">{t('coach.noFuture')}</p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
