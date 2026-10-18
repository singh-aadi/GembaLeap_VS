import { AiBlock } from '@/components/app/ai-block'
import { ClaimList } from '@/components/app/claim-list'
import { Stat, StatRow } from '@/components/app/stat'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Table, Td, Th } from '@/components/ui/table'
import { useFormat } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import type { ReportDetail } from '../queries'

/** The report as both sides read it. Identical bytes on both sides is what the seal proves. */
export function ReportDocument({ data }: { data: ReportDetail }) {
  const t = useT()
  const f = useFormat()
  const pick = useLocalized()
  const { report, timeZone } = data
  const m = report.metrics
  return (
    <div className="space-y-4">
      <StatRow>
        <Stat
          label={t('report.m.checks')}
          value={`${m.checksDone}/${m.checksDue}`}
          hint={f.percent(m.checksDone / m.checksDue, 1)}
          tone={m.checksDone / m.checksDue >= 0.95 ? 'good' : 'warn'}
        />
        <Stat
          label={t('report.m.ool')}
          value={m.outOfLimit}
          hint={t('report.m.contained', { count: m.contained })}
          tone={m.outOfLimit > m.contained ? 'bad' : undefined}
        />
        <Stat
          label={t('report.m.ftr')}
          value={`${m.lotsFirstTimeRight}/${m.lotsShipped}`}
          hint={t('report.m.lots')}
        />
        <Stat
          label={t('report.m.loss')}
          value={t('common.minutes', { n: m.lossMinutes })}
          hint={t('report.m.events', { count: m.eventsConfirmed })}
        />
        <Stat
          label={t('report.m.ncr')}
          value={m.openNcrs}
          tone={m.openNcrs > 0 ? 'warn' : undefined}
        />
      </StatRow>

      <Card className="p-4">
        <AiBlock
          approved={report.status === 'published'}
          approvedLabel={
            data.approvedByName ? t('report.approvedBy', { name: data.approvedByName }) : undefined
          }
          source={t('report.preparedFrom', {
            count: report.evidenceCount,
            time: f.dateTime(report.preparedAt, timeZone),
          })}
        >
          {(
            [
              ['report.highlights', report.highlights],
              ['report.risks', report.risks],
              ['report.actions', report.actions],
            ] as const
          ).map(([label, claims]) =>
            claims.length > 0 ? (
              <section key={label} className="mt-4 first:mt-2">
                <h2 className="text-sm">{t(label)}</h2>
                <div className="mt-2">
                  <ClaimList claims={claims} evidence={data.evidence} timeZone={timeZone} />
                </div>
              </section>
            ) : null,
          )}
        </AiBlock>
      </Card>

      <Card>
        <CardHeader title={t('report.byStage')} description={t('report.byStage.hint')} />
        <CardBody className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>{t('report.col.stage')}</Th>
                <Th className="text-right">{t('report.col.checks')}</Th>
                <Th className="text-right">{t('report.col.ool')}</Th>
              </tr>
            </thead>
            <tbody>
              {report.stageRows.map((row) => {
                const name = data.stageNames[row.stageId]
                return (
                  <tr key={row.stageId}>
                    <Td>{name ? pick(name) : row.stageId}</Td>
                    <Td className="text-right tabular-nums">
                      {row.checksDone}/{row.checksDue}
                    </Td>
                    <Td
                      className={
                        row.outOfLimit > 0
                          ? 'text-right font-medium text-bad tabular-nums'
                          : 'text-right tabular-nums'
                      }
                    >
                      {row.outOfLimit}
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  )
}
