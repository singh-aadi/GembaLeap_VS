// Writes the seed as JSON for the agent service, evals and the Firestore loader.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSeed } from '../src/index'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
mkdirSync(outDir, { recursive: true })
const seed = buildSeed()
writeFileSync(join(outDir, 'seed.json'), JSON.stringify(seed, null, 2))
console.log(`Wrote seed for ${seed.date} to ${outDir}/seed.json`)
