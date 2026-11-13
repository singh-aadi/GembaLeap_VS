import { useEffect, useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/cn'
import { type MessageId, useT } from '@/lib/i18n'

const LEVELS = [1, 2, 3, 4, 5] as const
type Level = (typeof LEVELS)[number]
const STEP_MS = 4500

const MOTION_QUERY = '(prefers-reduced-motion: reduce)'
function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  )
}

/**
 * The Sutra ladder as one scene that changes as the plant climbs: paper and
 * memory retire, the phone takes over, then the sealed record, the trend
 * chart and finally the network of buyers, lenders and certifiers.
 */
export function Transformation() {
  const t = useT()
  const reduced = usePrefersReducedMotion()
  const [level, setLevel] = useState<Level>(1)
  const [paused, setPaused] = useState(false)
  const playing = !reduced && !paused

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(
      () => setLevel((current) => (current === 5 ? 1 : ((current + 1) as Level))),
      STEP_MS,
    )
    return () => window.clearTimeout(timer)
  }, [level, playing])

  const key = (suffix: string) => `landing.ladder.${level}.${suffix}` as MessageId

  return (
    <div
      className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="grid lg:grid-cols-[1.35fr_1fr]">
        <div className="relative bg-subtle p-3 sm:p-5">
          <Scene level={level} />
        </div>
        <div className="flex flex-col justify-center gap-3 p-5 sm:p-7" aria-live="polite">
          <div key={`cap-${level}`} className="lp-rise">
            <p className="text-xs font-semibold tracking-widest text-accent uppercase">
              {t('landing.ladder.level', { level })}
            </p>
            <h3 className="mt-1 text-xl sm:text-2xl">{t(key('name'))}</h3>
            <p className="mt-2 text-sm text-muted sm:text-base">{t(key('body'))}</p>
            <div className="mt-4 grid gap-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="mt-0.5 rounded bg-bad-soft px-1.5 py-0.5 text-[11px] font-semibold text-bad">
                  {t('landing.ladder.before')}
                </span>
                <span className="text-muted line-through decoration-bad/40">{t(key('from'))}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-0.5 rounded bg-good-soft px-1.5 py-0.5 text-[11px] font-semibold text-good">
                  {t('landing.ladder.after')}
                </span>
                <span className="font-medium text-ink">{t(key('to'))}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ladder control */}
      <div className="border-t border-line p-3 sm:p-4">
        <ol className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {LEVELS.map((value) => {
            const active = value === level
            const done = value < level
            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => setLevel(value)}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'group relative block w-full overflow-hidden rounded-lg border px-1.5 py-2 text-left transition-colors sm:px-3',
                    active
                      ? 'border-accent bg-accent-soft'
                      : 'border-line bg-surface hover:bg-subtle',
                  )}
                >
                  <span
                    className={cn(
                      'block text-xs font-bold sm:text-sm',
                      active || done ? 'text-accent' : 'text-muted',
                    )}
                  >
                    L{value}
                  </span>
                  <span className="hidden truncate text-xs text-muted sm:block">
                    {t(`landing.ladder.${value}.name` as MessageId)}
                  </span>
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-line" />
                  {done ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" /> : null}
                  {active ? (
                    <span
                      key={`bar-${level}-${playing}`}
                      className={cn(
                        'absolute inset-x-0 bottom-0 h-0.5 bg-accent',
                        playing && 'lp-progress',
                      )}
                      style={{ ['--lp-duration' as string]: `${STEP_MS}ms` }}
                    />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

/* ---------- Scene ---------- */

const C = {
  paper: '#f6f1e3',
  paperLine: '#c9bfa4',
  ink: 'var(--gl-ink)',
  muted: 'var(--gl-muted)',
  line: 'var(--gl-line)',
  surface: 'var(--gl-surface)',
  accent: 'var(--gl-accent)',
  teal: 'var(--gl-teal)',
  good: 'var(--gl-good)',
  bad: 'var(--gl-bad)',
  warn: 'var(--gl-warn)',
  navy: '#0b1f3a',
} as const

function Scene({ level }: { level: Level }) {
  const t = useT()
  const paperRetired = level >= 2
  return (
    <svg
      viewBox="0 0 420 228"
      role="img"
      aria-label={t('landing.ladder.sceneAlt', { level })}
      className="h-auto w-full"
    >
      <rect x="0" y="0" width="420" height="228" rx="14" fill={C.surface} />
      <path d="M0 214 H420" stroke={C.line} strokeWidth="1.5" />

      {/* Paper register, retires at L2 */}
      <g key={`paper-${paperRetired}`} className={paperRetired ? 'lp-retire' : 'lp-rise'}>
        <rect
          x="22"
          y="70"
          width="92"
          height="120"
          rx="4"
          fill={C.paper}
          transform="rotate(-6 68 130)"
        />
        <g transform="rotate(-6 68 130)" stroke={C.paperLine} strokeWidth="2" strokeLinecap="round">
          <path d="M34 92 h60 M34 106 h68 M34 120 h52 M34 134 h64 M34 148 h44 M34 162 h58" />
          <path d="M88 118 l10 -6 M86 146 q8 8 14 -2" stroke="#b55" />
        </g>
        <rect
          x="56"
          y="62"
          width="26"
          height="10"
          rx="3"
          fill="#8a7f66"
          transform="rotate(-6 68 130)"
        />
        {/* Sticky notes */}
        <rect x="98" y="56" width="30" height="30" fill="#ffe27a" transform="rotate(8 113 71)" />
        <rect
          x="104"
          y="160"
          width="26"
          height="26"
          fill="#ffb3c1"
          transform="rotate(-10 117 173)"
        />
      </g>

      {/* Caliper: the tool stays, its reading starts to flow at L2 */}
      <g transform="translate(26 196)">
        <rect x="0" y="0" width="120" height="10" rx="2" fill="#9aa4b1" />
        <rect x="8" y="-22" width="8" height="24" fill="#9aa4b1" />
        <rect x="58" y="-16" width="22" height="26" rx="3" fill="#7d8896" />
        <rect x="61" y="-12" width="16" height="9" rx="1.5" fill="#cfe9d7" />
        <text x="69" y="-5" fontSize="6.5" textAnchor="middle" fill="#1b4" fontFamily="monospace">
          48.02
        </text>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M${22 + i * 8} 2 v${i % 2 ? 3 : 5}`} stroke="#5d6672" strokeWidth="1" />
        ))}
      </g>
      {level >= 2 ? (
        <path
          d="M95 182 C130 170 140 150 158 140"
          fill="none"
          stroke={C.accent}
          strokeWidth="2"
          className="lp-flow"
        />
      ) : null}

      {/* Phone: arrives at L1 to photograph paper, runs the checklist from L2 */}
      <g transform="translate(150 46)">
        <rect x="0" y="0" width="74" height="146" rx="12" fill={C.navy} />
        <rect x="5" y="12" width="64" height="122" rx="4" fill={C.surface} />
        <rect x="28" y="5" width="18" height="3" rx="1.5" fill="#33475f" />
        <g key={`phone-${level}`}>
          {level === 1 ? (
            <g>
              <rect
                x="11"
                y="22"
                width="52"
                height="64"
                rx="3"
                fill={C.paper}
                className="lp-rise"
              />
              <path
                d="M17 34 h36 M17 44 h40 M17 54 h30 M17 64 h38"
                stroke={C.paperLine}
                strokeWidth="2"
                className="lp-rise"
              />
              <circle cx="37" cy="112" r="11" fill="none" stroke={C.accent} strokeWidth="3" />
              <circle cx="37" cy="112" r="6" fill={C.accent} className="lp-pulse" />
              <rect
                x="5"
                y="12"
                width="64"
                height="122"
                rx="4"
                fill="#fff"
                className="lp-pulse"
                opacity="0.15"
              />
            </g>
          ) : (
            <g>
              {[0, 1, 2, 3].map((row) => {
                const failed = level === 2 && row === 2
                return (
                  <g key={row} className="lp-rise" style={{ animationDelay: `${row * 0.15}s` }}>
                    <rect
                      x="11"
                      y={24 + row * 24}
                      width="52"
                      height="18"
                      rx="3"
                      fill={failed ? 'var(--gl-warn-soft)' : 'var(--gl-subtle)'}
                    />
                    <circle cx="20" cy={33 + row * 24} r="5" fill={failed ? C.warn : C.good} />
                    <path
                      d={failed ? `M20 ${30 + row * 24} v4` : `M17.5 ${33 + row * 24} l2 2 l3.5 -4`}
                      stroke="#fff"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <rect
                      x="29"
                      y={30 + row * 24}
                      width="28"
                      height="3"
                      rx="1.5"
                      fill={C.muted}
                      opacity="0.5"
                    />
                    <rect
                      x="29"
                      y={36 + row * 24}
                      width="18"
                      height="2.5"
                      rx="1.25"
                      fill={C.muted}
                      opacity="0.3"
                    />
                  </g>
                )
              })}
              <rect
                x="11"
                y="122"
                width="52"
                height="8"
                rx="4"
                fill={C.accent}
                className="lp-pop"
                style={{ animationDelay: '0.7s' }}
              />
            </g>
          )}
        </g>
      </g>

      {/* Right panel: changes with the level */}
      <g key={`panel-${level}`} transform="translate(244 30)">
        {level === 1 ? <PanelRecorded /> : null}
        {level === 2 ? <PanelControlled /> : null}
        {level === 3 ? <PanelProven /> : null}
        {level === 4 ? <PanelImproving /> : null}
        {level === 5 ? <PanelConnected /> : null}
      </g>
    </svg>
  )
}

function PanelFrame({ children }: { children: React.ReactNode }) {
  return (
    <g className="lp-rise">
      <rect x="0" y="0" width="160" height="176" rx="10" fill="var(--gl-subtle)" stroke={C.line} />
      {children}
    </g>
  )
}

function PanelRecorded() {
  return (
    <PanelFrame>
      {/* Photos land in a shared folder: Drive tier */}
      <path d="M16 22 h40 l8 8 h80 v120 h-128 Z" fill="#fde9a8" stroke="#e2b93b" />
      {[0, 1, 2].map((i) => (
        <g key={i} className="lp-pop" style={{ animationDelay: `${0.3 + i * 0.25}s` }}>
          <rect x={26 + i * 40} y="52" width="32" height="40" rx="3" fill="#fff" stroke={C.line} />
          <rect x={30 + i * 40} y="56" width="24" height="18" fill={C.paper} />
          <path
            d={`M${30 + i * 40} 80 h22 M${30 + i * 40} 86 h16`}
            stroke={C.line}
            strokeWidth="2"
          />
        </g>
      ))}
      <rect x="26" y="108" width="108" height="8" rx="4" fill="#fff" />
      <rect x="26" y="108" width="54" height="8" rx="4" fill={C.accent} className="lp-progress" />
      <text x="80" y="136" textAnchor="middle" fontSize="10" fill={C.muted}>
        IMG_0412.jpg · 10:03
      </text>
    </PanelFrame>
  )
}

function PanelControlled() {
  return (
    <PanelFrame>
      <text x="14" y="22" fontSize="10" fontWeight="600" fill={C.ink}>
        Hole pitch · 48.00 ± 0.10
      </text>
      {/* Limits and readings */}
      <rect x="14" y="40" width="132" height="70" rx="4" fill="var(--gl-good-soft)" />
      <path d="M14 40 h132 M14 110 h132" stroke={C.good} strokeDasharray="4 3" />
      {[18, 40, 30, 52, 10, 26].map((y, i) => (
        <circle
          key={i}
          cx={26 + i * 22}
          cy={60 + (i === 4 ? -30 : y / 2)}
          r="4.5"
          fill={i === 4 ? C.bad : C.accent}
          className="lp-pop"
          style={{ animationDelay: `${0.2 + i * 0.15}s` }}
        />
      ))}
      <g className="lp-pop" style={{ animationDelay: '1.3s' }}>
        <rect
          x="14"
          y="124"
          width="132"
          height="38"
          rx="6"
          fill="var(--gl-warn-soft)"
          stroke={C.warn}
        />
        <text x="22" y="140" fontSize="9.5" fontWeight="600" fill="var(--gl-warn-ink)">
          Out of limit → contained
        </text>
        <text x="22" y="153" fontSize="9" fill={C.muted}>
          Die cleaned · re-measured
        </text>
      </g>
    </PanelFrame>
  )
}

function PanelProven() {
  return (
    <PanelFrame>
      {/* Hash-chained daily reports */}
      {[0, 1, 2].map((i) => (
        <g key={i} className="lp-rise" style={{ animationDelay: `${i * 0.2}s` }}>
          <rect
            x="14"
            y={14 + i * 46}
            width="96"
            height="36"
            rx="5"
            fill={C.surface}
            stroke={C.line}
          />
          <rect x="22" y={22 + i * 46} width="50" height="4" rx="2" fill={C.ink} opacity="0.6" />
          <text x="22" y={40 + i * 46} fontSize="8" fontFamily="monospace" fill={C.muted}>
            {['9f3a…c21', '4b7e…08d', 'e1c9…7a4'][i]}
          </text>
          {i < 2 ? (
            <path
              d={`M62 ${50 + i * 46} v10`}
              stroke={C.teal}
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : null}
        </g>
      ))}
      <g className="lp-pop" style={{ animationDelay: '0.9s' }}>
        <circle cx="132" cy="76" r="20" fill={C.teal} />
        <path
          d="M122 76 l7 7 l13 -14"
          stroke="#fff"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text
        x="132"
        y="112"
        textAnchor="middle"
        fontSize="9"
        fontWeight="600"
        fill={C.teal}
        className="lp-rise"
        style={{ animationDelay: '1.1s' }}
      >
        Buyer verified
      </text>
    </PanelFrame>
  )
}

function PanelImproving() {
  const points = 'M14 112 L32 104 L50 108 L68 94 L86 90 L104 78 L122 72 L146 62'
  return (
    <PanelFrame>
      <text x="14" y="22" fontSize="10" fontWeight="600" fill={C.ink}>
        First-pass yield
      </text>
      <path d="M14 50 h132 M14 128 h132" stroke={C.line} strokeDasharray="3 3" />
      <path
        d={points}
        fill="none"
        stroke={C.accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lp-draw"
        style={{ ['--lp-len' as string]: 180 }}
      />
      <circle
        cx="146"
        cy="62"
        r="5"
        fill={C.accent}
        className="lp-pop"
        style={{ animationDelay: '1.1s' }}
      />
      {['Gauge reader', 'SPC drift', '8D draft'].map((label, i) => (
        <g key={label} className="lp-pop" style={{ animationDelay: `${0.5 + i * 0.2}s` }}>
          <rect
            x={14 + i * 46}
            y="142"
            width="42"
            height="20"
            rx="10"
            fill="var(--gl-accent-soft)"
          />
          <text
            x={35 + i * 46}
            y="155"
            textAnchor="middle"
            fontSize="7"
            fontWeight="600"
            fill={C.accent}
          >
            {label}
          </text>
        </g>
      ))}
    </PanelFrame>
  )
}

function PanelConnected() {
  const nodes = [
    { x: 80, y: 30, label: 'OEM', color: C.accent },
    { x: 24, y: 128, label: 'Bank', color: C.good },
    { x: 136, y: 128, label: 'ZED', color: C.warn },
  ]
  return (
    <PanelFrame>
      {nodes.map((node, i) => (
        <path
          key={node.label}
          d={`M80 92 L${node.x} ${node.y}`}
          stroke={node.color}
          strokeWidth="2.5"
          className="lp-flow"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
      <g className="lp-pop">
        <circle cx="80" cy="92" r="22" fill={C.teal} />
        <text x="80" y="96" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
          Plant
        </text>
      </g>
      {nodes.map((node, i) => (
        <g key={node.label} className="lp-pop" style={{ animationDelay: `${0.3 + i * 0.2}s` }}>
          <circle
            cx={node.x}
            cy={node.y}
            r="17"
            fill={C.surface}
            stroke={node.color}
            strokeWidth="2.5"
          />
          <text
            x={node.x}
            y={node.y + 3.5}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill={C.ink}
          >
            {node.label}
          </text>
        </g>
      ))}
      <text x="80" y="166" textAnchor="middle" fontSize="8.5" fill={C.muted}>
        Less inspection · faster pay
      </text>
    </PanelFrame>
  )
}
