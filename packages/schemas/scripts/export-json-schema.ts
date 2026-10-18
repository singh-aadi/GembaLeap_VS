// Writes one JSON Schema document with every exported Zod schema under $defs,
// shared types referenced by name, so services/agents can generate Pydantic models.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import * as schemas from '../src/index'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'json-schema')
mkdirSync(outDir, { recursive: true })

const registry = z.registry<{ id: string }>()
for (const [name, value] of Object.entries(schemas)) {
  if (
    value instanceof z.ZodObject ||
    value instanceof z.ZodEnum ||
    value instanceof z.ZodDiscriminatedUnion
  ) {
    registry.add(value, { id: name })
  }
}

const { schemas: defs } = z.toJSONSchema(registry, {
  target: 'draft-2020-12',
  io: 'output',
  uri: (id) => `#/$defs/${id}`,
})
for (const def of Object.values(defs)) delete def.$schema

writeFileSync(
  join(outDir, 'gembaleap.schema.json'),
  JSON.stringify({ $schema: 'https://json-schema.org/draft/2020-12/schema', $defs: defs }, null, 2),
)
console.log(`Wrote ${Object.keys(defs).length} schemas to ${outDir}`)
