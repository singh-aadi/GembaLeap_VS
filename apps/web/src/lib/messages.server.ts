import type { Locale } from '@gembaleap/schemas'
import en from '../../messages/en.json'
import hi from '../../messages/hi.json'
import id from '../../messages/id.json'
import ja from '../../messages/ja.json'
import ta from '../../messages/ta.json'
import vi from '../../messages/vi.json'

const catalogues: Record<Locale, Record<string, string>> = { en, ja, vi, hi, ta, id }

/** English fills any key a locale has not translated yet; `pnpm i18n:check` reports the gaps. */
export function loadMessages(locale: Locale): Record<string, string> {
  return { ...en, ...catalogues[locale] }
}
