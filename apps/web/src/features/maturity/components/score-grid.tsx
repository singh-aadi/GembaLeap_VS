import { Dimension } from '@gembaleap/schemas'
import { LevelChip } from '@/components/app/ladder-bar'
import { Card } from '@/components/ui/card'
import { Table, Td, Th } from '@/components/ui/table'
import { useT } from '@/lib/i18n'
import { useLocalized } from '@/lib/localized'
import type { MaturityCell, MaturityStage } from '../queries'
import { ScoreStateIcon } from './score-state-icon'

function Cell({ cell, onSelect }: { cell: MaturityCell; onSelect: (cell: MaturityCell) => void }) {
  const t = useT()
  return (
    <button
      type="button"
      onClick={() => onSelect(cell)}
      className="inline-flex h-11 items-center gap-1.5 rounded-lg px-1 hover:bg-subtle"
      aria-label={t('score.open', {
        dimension: t(`dimension.${cell.dimension}`),
        level: cell.level,
      })}
    >
      <LevelChip level={cell.level} />
      <ScoreStateIcon state={cell.state} />
    </button>
  )
}

/** Stages × five dimensions. A stage's level is the lowest of its dimensions. */
export function ScoreGrid({
  stages,
  onSelect,
}: {
  stages: MaturityStage[]
  onSelect: (cell: MaturityCell) => void
}) {
  const t = useT()
  const pick = useLocalized()
  return (
    <>
      <Card className="hidden md:block">
        <Table>
          <thead>
            <tr>
              <Th>{t('maturity.stage')}</Th>
              {Dimension.options.map((d) => (
                <Th key={d}>{t(`dimension.${d}`)}</Th>
              ))}
              <Th>{t('maturity.stageLevel')}</Th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage) => (
              <tr key={stage.id}>
                <Td className="font-medium">{pick(stage.name)}</Td>
                {stage.cells.map((cell) => (
                  <Td key={cell.dimension} className="py-1">
                    <Cell cell={cell} onSelect={onSelect} />
                  </Td>
                ))}
                <Td>
                  <LevelChip level={stage.level} className="ring-2 ring-accent/30" />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <div className="space-y-3 md:hidden">
        {stages.map((stage) => (
          <Card key={stage.id}>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-sm">{pick(stage.name)}</h2>
              <LevelChip level={stage.level} />
            </div>
            <ul className="divide-y divide-line">
              {stage.cells.map((cell) => (
                <li
                  key={cell.dimension}
                  className="flex items-center justify-between gap-3 px-4 py-1"
                >
                  <span className="text-sm">{t(`dimension.${cell.dimension}`)}</span>
                  <Cell cell={cell} onSelect={onSelect} />
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  )
}
