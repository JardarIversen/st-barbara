import {getSanityClient} from './lib/sanity-client.mjs'
import {allManifestItems, readManifest, resolveFilePath, sha256File} from './lib/manifest-utils.mjs'

const manifestPath = process.argv.slice(2).find((argument) => !argument.startsWith('--'))
const manifestContext = manifestPath ? readManifest(manifestPath) : undefined
const manifest = manifestContext?.manifest
const client = getSanityClient()
const types = [
  'bulletin',
  'place',
  'recurringMassSchedule',
  'event',
  'announcement',
  'massException',
  'massText',
  'article',
]
const documents = await client.fetch(`*[_type in $types]`, {types})
const errors = []
const warnings = []
const counts = Object.fromEntries(types.map((type) => [type, 0]))
const sourceKeys = new Map()

for (const document of documents) {
  counts[document._type] += 1
  if (!document.sourceKey) {
    warnings.push(`${document._type}/${document._id} mangler sourceKey.`)
  } else {
    const lookup = `${document._type}:${document.sourceKey}`
    if (sourceKeys.has(lookup)) errors.push(`Duplikat sourceKey: ${lookup}`)
    sourceKeys.set(lookup, document)
  }

  if (document._type === 'bulletin') {
    if (!document.pdf?.asset?._ref) errors.push(`${document.sourceKey} mangler PDF.`)
    if (!document.sourceHash) errors.push(`${document.sourceKey} mangler sourceHash.`)
    if (!document.issueDate || !document.coversFrom || !document.coversUntil) {
      errors.push(`${document.sourceKey} mangler datodekning.`)
    }
    if (document.coversUntil < document.coversFrom) {
      errors.push(`${document.sourceKey} har ugyldig datodekning.`)
    }
  }

  if (document._type === 'event' && document.endsAt && document.endsAt < document.startsAt) {
    errors.push(`${document.sourceKey} slutter før start.`)
  }

  if (
    document._type === 'announcement' &&
    document.appliesFrom &&
    document.appliesUntil &&
    document.appliesUntil < document.appliesFrom
  ) {
    errors.push(`${document.sourceKey} har ugyldig relevansperiode.`)
  }

  if (document._type === 'massException') {
    if (!document.schedule?._ref) errors.push(`${document.sourceKey} mangler messeplan.`)
    if (document.scope === 'dateRange' && (!document.rangeStart || !document.rangeEnd)) {
      errors.push(`${document.sourceKey} mangler datointervall.`)
    }
    if (document.scope !== 'dateRange' && !document.occurrenceDate) {
      errors.push(`${document.sourceKey} mangler forekomstdato.`)
    }
  }
}

if (manifest) {
  for (const {type, item} of allManifestItems(manifest)) {
    if (!sourceKeys.has(`${type}:${item.sourceKey}`)) {
      errors.push(`Manifestinnhold mangler i Sanity: ${type}:${item.sourceKey}`)
    }
  }

  for (const item of manifest.bulletins ?? []) {
    const document = sourceKeys.get(`bulletin:${item.sourceKey}`)
    if (!document) continue

    const currentHash = sha256File(resolveFilePath(item.pdfPath, manifestContext.baseDirectory))
    if (document.sourceHash !== currentHash) {
      errors.push(`${item.sourceKey} peker ikke på PDF-en i manifestet.`)
    }

    const expectedPreviousHashes = new Set(
      (item.previousVersions ?? []).map((revision) =>
        sha256File(resolveFilePath(revision.pdfPath, manifestContext.baseDirectory)),
      ),
    )
    const actualPrevious = document.previousRevisions ?? []
    const actualPreviousHashes = actualPrevious.map((revision) => revision.sourceHash)
    if (new Set(actualPreviousHashes).size !== actualPreviousHashes.length) {
      errors.push(`${item.sourceKey} har dupliserte tidligere revisjoner.`)
    }
    for (const expectedHash of expectedPreviousHashes) {
      if (!actualPreviousHashes.includes(expectedHash)) {
        errors.push(`${item.sourceKey} mangler en tidligere PDF-versjon fra manifestet.`)
      }
    }
    if (actualPrevious.length !== expectedPreviousHashes.size) {
      errors.push(`${item.sourceKey} har uventet antall tidligere revisjoner.`)
    }
    if (document.revision !== actualPrevious.length + 1) {
      errors.push(`${item.sourceKey} har inkonsistent revisjonsnummer.`)
    }
    if (actualPrevious.some((revision) => !revision.pdf?.asset?._ref || !revision.sourceHash)) {
      errors.push(`${item.sourceKey} har en ufullstendig tidligere revisjon.`)
    }
  }
}

console.log('Dokumenttelling:', counts)
for (const warning of warnings) console.warn(`ADVARSEL: ${warning}`)
for (const error of errors) console.error(`FEIL: ${error}`)

if (errors.length) {
  console.error(`Verifikasjon feilet med ${errors.length} feil.`)
  process.exit(1)
}

console.log(`Verifikasjon bestått (${documents.length} dokumenter, ${warnings.length} advarsler).`)
