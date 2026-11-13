import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { AiBlock } from '@/components/app/ai-block'
import { BackLink } from '@/components/app/back-link'
import { EvidenceList } from '@/components/app/evidence-link'
import { LevelChip } from '@/components/app/ladder-bar'
import { PageHeader } from '@/components/app/page-header'
import { Stat, StatRow } from '@/components/app/stat'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import { toastError } from '@/lib/errors'
import { useT } from '@/lib/i18n'
import { switchOnSkill } from '../api'
import { coachKeys, plantQuery } from '../queries'
import { ProcessMapView } from './process-map'

const route = getRouteApi('/c/plants/$siteId')

/** One plant for the coach: baseline, current vs future flow, and the recipe picker. */
export function PlantPage() {
  const t = useT()
  const { siteId } = route.useParams()
  const queryClient = useQueryClient()
  const switchOn = useServerFn(switchOnSkill)
  const { data } = useSuspenseQuery(plantQuery(siteId))
  const mutation = useMutation({
    mutationFn: (skill: Parameters<typeof switchOn>[0]['data']['skill']) =>
      switchOn({ data: { siteId, skill } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coachKeys.all }),
    onError: (error) => toastError(t, error),
  })
  const b = data.baseline
  return (
    <>
      <PageHeader
        back={<BackLink to="/c/plants">{t('nav.plants')}</BackLink>}
        title={data.plant}
        meta={`${data.site} · ${data.profile?.cluster ?? ''} · ${data.profile?.udyamNo ?? ''}`}
      />
      <StatRow className="mb-4">
        <Stat label={t('nav.level')} value={<LevelChip level={data.level?.level ?? 0} />} />
        <Stat label={t('coach.employees')} value={data.profile?.employees ?? '—'} />
        <Stat
          label={t('coach.turnover')}
          value={data.profile ? `₹${data.profile.turnoverCrore} cr` : '—'}
        />
        <Stat label={t('coach.zed')} value={t(`coach.zedLevel.${data.profile?.zed ?? 'none'}`)} />
        <Stat
          label={t('coach.skillsLabel')}
          value={data.skills.filter((s) => s.enabled).length}
          hint={t('coach.target5')}
        />
      </StatRow>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ProcessMapView
          current={data.current}
          future={data.future}
          skills={data.skills}
          onSwitchOn={(skill) => mutation.mutate(skill)}
          pending={mutation.isPending}
        />
        <Card className="self-start">
          <CardHeader
            title={t('coach.baselineTitle')}
            description={
              b
                ? t('coach.baselineMeta', {
                    questions: b.questionsAnswered,
                    media: b.walkMedia,
                    days: b.recordDays,
                  })
                : t('coach.baseline.not_started')
            }
            action={
              b?.secondAssessorLevel !== undefined ? (
                <Badge tone="good">
                  {t('coach.secondAssessor', { level: b.secondAssessorLevel })}
                </Badge>
              ) : undefined
            }
          />
          {b ? (
            <div className="p-4">
              <AiBlock approved={b.status === 'reviewed'} approvedLabel={t('coach.reviewed')}>
                <ul className="space-y-4">
                  {b.dimensions.map((d) => (
                    <li key={d.dimension}>
                      <p className="flex items-center justify-between gap-2 text-sm font-medium">
                        {t(`dimension.${d.dimension}`)}
                        <LevelChip level={d.level} />
                      </p>
                      <p className="mt-1 text-sm text-ink">{d.rationale}</p>
                      <p className="mt-1 text-xs text-muted">
                        {t('coach.nextGap')}: {d.nextGap}
                      </p>
                      <EvidenceList
                        ids={d.evidenceIds}
                        evidence={data.evidence}
                        timeZone={data.timeZone}
                      />
                    </li>
                  ))}
                </ul>
              </AiBlock>
            </div>
          ) : null}
        </Card>
      </div>
    </>
  )
}
