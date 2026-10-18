import { useIntl } from 'react-intl'
import type en from '../../messages/en.json'

export type MessageId = keyof typeof en
type Values = Record<string, string | number | Date>

export function useT() {
  const intl = useIntl()
  return (id: MessageId, values?: Values) => intl.formatMessage({ id }, values)
}

export const LOCALE_NAMES = {
  en: 'English',
  ja: '日本語',
  vi: 'Tiếng Việt',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  id: 'Bahasa Indonesia',
} as const
