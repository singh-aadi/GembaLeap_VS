// Fails when a locale has stale keys, mismatched placeholders, or gaps in the
// screens it must fully cover. Other gaps fall back to English at runtime.
import { readFileSync } from 'node:fs'

const dir = new URL('../messages/', import.meta.url)
const load = (locale) => JSON.parse(readFileSync(new URL(`${locale}.json`, dir), 'utf8'))

/** Screens line staff use; every locale must cover them completely. */
const LINE_STAFF = [
  'ai',
  'brief',
  'capture',
  'check',
  'checklist',
  'common',
  'error',
  'event',
  'eventType',
  'events',
  'evidence',
  'login',
  'nav',
  'offline',
  'role',
  'shell',
  'slot',
  'today',
]
const REQUIRED = { ja: 'all', vi: LINE_STAFF, hi: LINE_STAFF, ta: LINE_STAFF, id: LINE_STAFF }

const en = load('en')
const args = (message) => new Set([...message.matchAll(/\{\s*([a-zA-Z0-9_]+)/g)].map((m) => m[1]))
let failed = false

for (const [locale, scope] of Object.entries(REQUIRED)) {
  const messages = load(locale)
  const problems = []
  for (const [key, value] of Object.entries(messages)) {
    if (!(key in en)) {
      problems.push(`unknown key ${key}`)
      continue
    }
    const expected = [...args(en[key])].sort().join(',')
    const actual = [...args(value)].sort().join(',')
    if (expected !== actual)
      problems.push(`${key}: placeholders {${actual}} should be {${expected}}`)
  }
  const required = Object.keys(en).filter(
    (key) => scope === 'all' || scope.includes(key.split('.')[0]),
  )
  for (const key of required) if (!(key in messages)) problems.push(`missing ${key}`)

  const coverage = Math.round((Object.keys(messages).length / Object.keys(en).length) * 100)
  console.log(
    `${locale}: ${coverage}% of keys${problems.length ? `, ${problems.length} problems` : ''}`,
  )
  for (const problem of problems) console.log(`  ${problem}`)
  failed ||= problems.length > 0
}

process.exit(failed ? 1 : 0)
