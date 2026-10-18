/**
 * The demo runs on a fixed clock: 11:20 at the Japanese plant on the current
 * JST date (02:20 UTC). Set SEED_DATE=YYYY-MM-DD to pin the date in tests.
 */
export function demoDate(): string {
  const fromEnv = process.env.SEED_DATE
  if (fromEnv && /^\d{4}-\d{2}-\d{2}$/.test(fromEnv)) return fromEnv
  return new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10)
}

export type Clock = {
  date: string
  now: string
  /** ISO instant for a local wall-clock time `dayOffset` days from the demo date. */
  local: (dayOffset: number, hhmm: string, utcOffsetMinutes: number) => string
  dateOf: (dayOffset: number) => string
}

export function createClock(date: string): Clock {
  const base = Date.parse(`${date}T00:00:00.000Z`)
  const day = 86_400_000
  return {
    date,
    now: new Date(base + (2 * 60 + 20) * 60_000).toISOString(),
    local(dayOffset, hhmm, offset) {
      const [h = 0, m = 0] = hhmm.split(':').map(Number)
      return new Date(base + dayOffset * day + (h * 60 + m - offset) * 60_000).toISOString()
    },
    dateOf(dayOffset) {
      return new Date(base + dayOffset * day).toISOString().slice(0, 10)
    },
  }
}

export const JST = 9 * 60
export const IST = 5 * 60 + 30
