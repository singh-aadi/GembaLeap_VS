import type { LocalizedText } from '@gembaleap/schemas'
import { useIntl } from 'react-intl'

/** Picks tenant-authored text in the reader's language, falling back to English. */
export function useLocalized() {
  const { locale } = useIntl()
  return (text: LocalizedText) => text[locale as keyof LocalizedText] ?? text.en
}
