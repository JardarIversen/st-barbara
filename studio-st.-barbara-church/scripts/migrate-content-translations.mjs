import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {URL} from 'node:url'
import {getSanityClient, REPO_ROOT} from './lib/sanity-client.mjs'
import {CONTENT_TYPES, planTranslation} from './lib/migrate-translations.mjs'

const commit = process.argv.includes('--commit')
const dictionary = JSON.parse(
  fs.readFileSync(new URL('./migrations/2026-09-06-content.en.json', import.meta.url), 'utf8'),
)
const client = getSanityClient().withConfig({perspective: 'raw'})
const query = '*[_type in $types && !(_id in path("versions.**"))] | order(_id asc)'
const before = await client.fetch(query, {types: CONTENT_TYPES})
const plans = before.map((document) => planTranslation(document, dictionary))
const pending = plans.filter((plan) => plan.added.length)
const missing = plans.flatMap((plan) => plan.missing.map((text) => ({id: plan.id, text})))
console.log(
  JSON.stringify(
    {
      mode: commit ? 'COMMIT' : 'DRY RUN',
      documents: before.length,
      toUpdate: pending.length,
      fields: pending.reduce((sum, plan) => sum + plan.added.length, 0),
      missing,
    },
    null,
    2,
  ),
)
if (missing.length) throw new Error('Manglende oversettelser. Ingen dokumenter er endret.')
if (!commit || !pending.length) process.exit(0)

const backupDirectory = path.join(REPO_ROOT, '.local', 'sanity-backups')
fs.mkdirSync(backupDirectory, {recursive: true})
const backupPath = path.join(
  backupDirectory,
  `translations-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
)
fs.writeFileSync(backupPath, JSON.stringify(before, null, 2), {flag: 'wx'})
// Atomic transaction: abort all patches if any source document changed meanwhile.
let transaction = client.transaction()
for (const plan of pending)
  transaction = transaction.patch(plan.id, (patch) =>
    patch.ifRevisionId(plan.rev).set({translations: plan.translations}),
  )
await transaction.commit()

const after = await client.fetch(query, {types: CONTENT_TYPES})
assert.equal(after.length, before.length)
const sourceOnly = (document) =>
  Object.fromEntries(
    Object.entries(document).filter(
      ([key]) => !['translations', '_rev', '_updatedAt'].includes(key),
    ),
  )
for (const original of before) {
  const current = after.find((document) => document._id === original._id)
  assert.deepEqual(
    sourceOnly(current),
    sourceOnly(original),
    `Norsk innhold endret: ${original._id}`,
  )
  const expected = plans.find((plan) => plan.id === original._id)
  if (expected.added.length) assert.deepEqual(current.translations, expected.translations)
}
assert.equal(
  after.map((document) => planTranslation(document, dictionary)).filter((plan) => plan.added.length)
    .length,
  0,
)
console.log(
  `Kontroll OK: ${pending.length} dokumenter oppdatert, norsk innhold uendret, andre kjøring gir 0 endringer. Backup: ${backupPath}`,
)
