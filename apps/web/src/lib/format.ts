import { useIntl } from 'react-intl'

/** Formatting in the plant's own time zone, so 06:00 on the line reads as 06:00 everywhere. */
export function useFormat() {
  const intl = useIntl()
  return {
    time: (iso: string, timeZone?: string) =>
      intl.formatTime(iso, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }),
    date: (iso: string, timeZone?: string) =>
      intl.formatDate(iso, { day: 'numeric', month: 'short', timeZone }),
    weekday: (iso: string, timeZone?: string) =>
      intl.formatDate(iso, { weekday: 'short', day: 'numeric', month: 'short', timeZone }),
    dateTime: (iso: string, timeZone?: string) =>
      intl.formatDate(iso, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone,
      }),
    /** Calendar dates (YYYY-MM-DD) carry no time zone. */
    day: (date: string) =>
      intl.formatDate(`${date}T12:00:00Z`, { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    number: (value: number, digits = 0) =>
      intl.formatNumber(value, { minimumFractionDigits: digits, maximumFractionDigits: digits }),
    percent: (ratio: number, digits = 0) =>
      intl.formatNumber(ratio, {
        style: 'percent',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }),
    money: (amount: number, currency: string) =>
      intl.formatNumber(amount, { style: 'currency', currency, maximumFractionDigits: 0 }),
  }
}

/** Short, stable label for a ULID: the last six characters. */
export function shortId(id: string) {
  return id.slice(-6)
}
