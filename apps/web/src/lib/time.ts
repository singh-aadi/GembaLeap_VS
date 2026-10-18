/** Offset in minutes of `timeZone` at the given instant, e.g. +540 for Asia/Tokyo. */
export function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(instant)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'))
  return Math.round((asUtc - instant.getTime()) / 60_000)
}

/** The instant of a local wall-clock time (YYYY-MM-DD + HH:mm) in a plant's time zone. */
export function zonedInstant(date: string, hhmm: string, timeZone: string): string {
  const naive = new Date(`${date}T${hhmm}:00.000Z`)
  const offset = zoneOffsetMinutes(naive, timeZone)
  return new Date(naive.getTime() - offset * 60_000).toISOString()
}

/** Calendar date (YYYY-MM-DD) of an instant in a plant's time zone. */
export function zonedDate(iso: string, timeZone: string): string {
  const instant = new Date(iso)
  return new Date(instant.getTime() + zoneOffsetMinutes(instant, timeZone) * 60_000)
    .toISOString()
    .slice(0, 10)
}
