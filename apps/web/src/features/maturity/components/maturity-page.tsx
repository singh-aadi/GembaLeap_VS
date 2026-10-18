import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { MessagesSquare } from 'lucide-react'
import { useState } from 'react'
import { LadderBar } from '@/components/app/ladder-bar'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import { maturityQuery, type MaturityCell } from '../queries'
import { LadderLegend } from './ladder-legend'
import { ScoreGrid } from './score-grid'
import { ScoreSheet } from './score-sheet'

export function MaturityPage() {
  const t = useT()
  const f = useFormat()
  const pick = useLocalized()
  const { data } = useSuspenseQuery(maturityQuery())
  const [selected, setSelected] = useState<MaturityCell | null>(null)
  const stage = data.stages.find((s) => s.id === selected?.stageId)

  return (
    <>
      <PageHeader
        title={t('nav.maturity')}
        meta={t('maturity.meta', { date: f.date(data.assessedAt, data.timeZone), ...data.counts })}
        actions={
          <Button asChild>
            <Link to="/s/audit">
              <MessagesSquare aria-hidden />
              {t('maturity.reassess')}
            </Link>
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted">{t('maturity.site')}</p>
                <p className="mt-1 text-xl font-semibold text-heading tabular-nums">
                  L{data.ladderLevel}{' '}
                  <span className="text-sm font-normal text-muted">
                    · {t('home.index', { index: f.number(data.siteIndex, 1) })}
                  </span>
                </p>
              </div>
              <LadderBar level={data.ladderLevel} target={data.ladderLevel + 1} />
              <p className="w-full text-xs text-muted">{t('maturity.rule')}</p>
            </CardBody>
          </Card>
          <ScoreGrid stages={data.stages} onSelect={setSelected} />
        </div>
        <Card>
          <CardHeader title={t('maturity.ladder')} />
          <CardBody>
            <LadderLegend current={data.ladderLevel} />
          </CardBody>
        </Card>
      </div>
      <ScoreSheet
        cell={selected}
        stageName={stage ? pick(stage.name) : ''}
        evidence={data.evidence}
        timeZone={data.timeZone}
        onClose={() => setSelected(null)}
      />
    </>
  )
}
