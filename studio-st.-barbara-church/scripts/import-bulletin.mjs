import fs from 'node:fs'
import {getSanityClient} from './lib/sanity-client.mjs'
import {prepareTranslations, translationErrors} from './lib/translations.mjs'
import {
  readManifest,
  resolveFilePath,
  sha256File,
  slugify,
  stableKey,
  toLinks,
  toPortableText,
  uniqueReferences,
  validateManifest,
  allManifestItems,
} from './lib/manifest-utils.mjs'

const args = process.argv.slice(2)
const commit = args.includes('--commit')
const manifestPath = args.find((argument) => !argument.startsWith('--'))

if (!manifestPath) {
  console.error('Bruk: npm run bulletin:import -- <manifest.json> [--commit]')
  process.exit(1)
}

const {manifest, absolutePath, baseDirectory} = readManifest(manifestPath)
const validationErrors = validateManifest(manifest, baseDirectory)
for (const {type, item} of allManifestItems(manifest)) {
  validationErrors.push(...translationErrors(item.translations, type).map(error => `${item.sourceKey}: ${error}`))
}

if (validationErrors.length) {
  console.error('Manifestet er ugyldig:')
  for (const error of validationErrors) console.error(`- ${error}`)
  process.exit(1)
}

const counts = Object.fromEntries(
  [
    'bulletins',
    'places',
    'massSchedules',
    'events',
    'announcements',
    'massExceptions',
    'massTexts',
    'articles',
  ].map((name) => [name, (manifest[name] ?? []).length]),
)

console.log(`Manifest: ${absolutePath}`)
console.log(`Modus: ${commit ? 'PUBLISERER' : 'TØRRKJØRING'}`)
console.log(counts)

if (!commit) {
  for (const bulletin of manifest.bulletins ?? []) {
    const pdfPath = resolveFilePath(bulletin.pdfPath, baseDirectory)
    console.log(`- ${bulletin.sourceKey}: ${sha256File(pdfPath).slice(0, 12)}…`)
    for (const previous of bulletin.previousVersions ?? []) {
      const previousPath = resolveFilePath(previous.pdfPath, baseDirectory)
      console.log(`  tidligere: ${sha256File(previousPath).slice(0, 12)}…`)
    }
  }
  console.log('Ingen data ble endret. Kjør på nytt med --commit for å publisere.')
  process.exit(0)
}

const client = getSanityClient()
const cache = new Map()

function withoutUndefined(value) {
  if (Array.isArray(value)) return value.map(withoutUndefined)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, child]) => child !== undefined)
      .map(([key, child]) => [key, withoutUndefined(child)]),
  )
}

async function findBySourceKey(type, sourceKey) {
  const cacheKey = `${type}:${sourceKey}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)
  const document = await client.fetch(`*[_type == $type && sourceKey == $sourceKey][0]`, {
    type,
    sourceKey,
  })
  if (document) cache.set(cacheKey, document)
  return document
}

async function upsert(type, sourceKey, fields) {
  const existing = await findBySourceKey(type, sourceKey)
  const incoming = allManifestItems(manifest).find(entry => entry.type === type && entry.item.sourceKey === sourceKey)?.item.translations
  const translations = prepareTranslations(existing, fields, incoming, sourceKey)
  if (translations !== undefined) fields = {...fields, translations}
  const fieldsToUnset = Object.entries(fields)
    .filter(([, value]) => value === null)
    .map(([field]) => field)
  const cleanFields = withoutUndefined(
    Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== null)),
  )
  let document
  if (existing) {
    let patch = client.patch(existing._id).set(cleanFields)
    if (fieldsToUnset.length) patch = patch.unset(fieldsToUnset)
    document = await patch.commit({autoGenerateArrayKeys: true})
  } else {
    document = await client.create({_type: type, sourceKey, ...cleanFields})
  }

  cache.set(`${type}:${sourceKey}`, document)
  console.log(`${existing ? 'Oppdatert' : 'Opprettet'} ${type}: ${sourceKey}`)
  return document
}

async function resolveReference(type, sourceKey, required = true) {
  if (!sourceKey) return undefined
  const document = await findBySourceKey(type, sourceKey)
  if (!document && required) throw new Error(`Fant ikke ${type} med sourceKey ${sourceKey}.`)
  return document ? {_type: 'reference', _ref: document._id} : undefined
}

async function resolveReferences(type, sourceKeys = []) {
  return Promise.all(sourceKeys.map((sourceKey) => resolveReference(type, sourceKey)))
}

async function sourceBulletinReferences(existing, sourceKeys, sourceKey) {
  const incoming = await resolveReferences('bulletin', sourceKeys)
  const merged = uniqueReferences([...(existing?.sourceBulletins ?? []), ...incoming])
  return merged.map((reference, index) => ({
    ...reference,
    _key: stableKey(sourceKey, 'bulletin', index, reference._ref),
  }))
}

async function importBulletin(item) {
  const pdfPath = resolveFilePath(item.pdfPath, baseDirectory)
  const sourceHash = sha256File(pdfPath)
  const existing = await findBySourceKey('bulletin', item.sourceKey)

  if (existing?.sourceHash === sourceHash) {
    return upsert('bulletin', item.sourceKey, {
      issueDate: item.issueDate,
      publishedAt: item.publishedAt ?? `${item.issueDate}T08:00:00+02:00`,
      coversFrom: item.coversFrom,
      coversUntil: item.coversUntil,
      internalNotes: item.internalNotes,
    })
  }

  const asset = await client.assets.upload('file', fs.createReadStream(pdfPath), {
    filename: item.filename ?? pdfPath.split(/[\\/]/).at(-1),
    contentType: 'application/pdf',
  })
  const pdf = {_type: 'file', asset: {_type: 'reference', _ref: asset._id}}
  const previousRevisions = [...(existing?.previousRevisions ?? [])]
  const knownHashes = new Set(previousRevisions.map((revision) => revision.sourceHash))

  for (const previous of item.previousVersions ?? []) {
    const previousPath = resolveFilePath(previous.pdfPath, baseDirectory)
    const previousHash = sha256File(previousPath)
    if (
      previousHash === sourceHash ||
      knownHashes.has(previousHash) ||
      existing?.sourceHash === previousHash
    ) {
      continue
    }
    const previousAsset = await client.assets.upload('file', fs.createReadStream(previousPath), {
      filename: previous.filename ?? previousPath.split(/[\\/]/).at(-1),
      contentType: 'application/pdf',
    })
    previousRevisions.push({
      _type: 'bulletinRevision',
      _key: stableKey(item.sourceKey, previousHash),
      pdf: {_type: 'file', asset: {_type: 'reference', _ref: previousAsset._id}},
      sourceHash: previousHash,
      supersededAt: previous.supersededAt ?? item.publishedAt ?? new Date().toISOString(),
      note: previous.note ?? 'Tidligere filversjon.',
    })
    knownHashes.add(previousHash)
  }

  if (existing?.pdf?.asset?._ref && existing.sourceHash && !knownHashes.has(existing.sourceHash)) {
    previousRevisions.push({
      _type: 'bulletinRevision',
      _key: stableKey(item.sourceKey, existing.sourceHash),
      pdf: existing.pdf,
      sourceHash: existing.sourceHash,
      supersededAt: new Date().toISOString(),
      note: item.revisionNote ?? 'Erstattet av en nyere fil med samme utgivelsesdato.',
    })
    knownHashes.add(existing.sourceHash)
  }

  return upsert('bulletin', item.sourceKey, {
    issueDate: item.issueDate,
    publishedAt: item.publishedAt ?? `${item.issueDate}T08:00:00+02:00`,
    coversFrom: item.coversFrom,
    coversUntil: item.coversUntil,
    pdf,
    sourceHash,
    revision: previousRevisions.length + 1,
    previousRevisions,
    internalNotes: item.internalNotes,
  })
}

for (const bulletin of manifest.bulletins ?? []) await importBulletin(bulletin)

for (const item of manifest.places ?? []) {
  await upsert('place', item.sourceKey, {
    name: item.name,
    slug: {_type: 'slug', current: item.slug ?? slugify(item.name)},
    placeType: item.placeType ?? 'venue',
    streetAddress: item.streetAddress,
    postalCode: item.postalCode,
    locality: item.locality,
    country: item.country ?? 'Norge',
    mapUrl: item.mapUrl,
    coordinates: item.coordinates
      ? {_type: 'geopoint', lat: item.coordinates.lat, lng: item.coordinates.lng}
      : undefined,
    details: toPortableText(item.details, item.sourceKey),
  })
}

for (const item of manifest.massSchedules ?? []) {
  await upsert('recurringMassSchedule', item.sourceKey, {
    title: item.title,
    status: item.status ?? 'active',
    place: await resolveReference('place', item.placeKey),
    language: item.language,
    anchorWeekday: item.anchorWeekday,
    recurrenceType: item.recurrenceType,
    weeksOfMonth: item.weeksOfMonth,
    dayOffset: item.dayOffset ?? 0,
    startTime: item.startTime,
    durationMinutes: item.durationMinutes,
    validFrom: item.validFrom,
    validUntil: item.validUntil,
    notes: item.notes,
  })
}

for (const item of manifest.events ?? []) {
  const existing = await findBySourceKey('event', item.sourceKey)
  await upsert('event', item.sourceKey, {
    title: item.title,
    slug: {_type: 'slug', current: item.slug ?? slugify(`${item.title}-${item.startsAt}`)},
    eventType: item.eventType ?? 'other',
    status: item.status ?? 'scheduled',
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    places: (await resolveReferences('place', item.placeKeys)).map((reference, index) => ({
      ...reference,
      _key: stableKey(item.sourceKey, 'place', index, reference._ref),
    })),
    parentEvent: await resolveReference('event', item.parentEventKey, false),
    summary: item.summary,
    body: toPortableText(item.body, item.sourceKey),
    language: item.language,
    registrationDeadline: item.registrationDeadline,
    promotionFrom: item.promotionFrom,
    promotionUntil: item.promotionUntil,
    links: toLinks(item.links, item.sourceKey),
    sourceBulletins: await sourceBulletinReferences(
      existing,
      item.sourceBulletinKeys,
      item.sourceKey,
    ),
  })
}

for (const item of (manifest.events ?? []).filter((event) => event.parentEventKey)) {
  const eventDocument = await findBySourceKey('event', item.sourceKey)
  const parentEvent = await resolveReference('event', item.parentEventKey)
  const updated = await client.patch(eventDocument._id).set({parentEvent}).commit()
  cache.set(`event:${item.sourceKey}`, updated)
}

for (const item of manifest.announcements ?? []) {
  const existing = await findBySourceKey('announcement', item.sourceKey)
  await upsert('announcement', item.sourceKey, {
    title: item.title,
    slug: {_type: 'slug', current: item.slug ?? slugify(item.title)},
    status: item.status ?? 'active',
    priority: item.priority ?? 'normal',
    publishedAt: item.publishedAt,
    lastMentionedAt: item.lastMentionedAt,
    appliesFrom: item.appliesFrom,
    appliesUntil: item.appliesUntil,
    summary: item.summary,
    body: toPortableText(item.body, item.sourceKey),
    places: (await resolveReferences('place', item.placeKeys)).map((reference, index) => ({
      ...reference,
      _key: stableKey(item.sourceKey, 'place', index, reference._ref),
    })),
    relatedEvents: (await resolveReferences('event', item.relatedEventKeys)).map(
      (reference, index) => ({
        ...reference,
        _key: stableKey(item.sourceKey, 'event', index, reference._ref),
      }),
    ),
    links: toLinks(item.links, item.sourceKey),
    sourceBulletins: await sourceBulletinReferences(
      existing,
      item.sourceBulletinKeys,
      item.sourceKey,
    ),
  })
}

for (const item of manifest.massExceptions ?? []) {
  const existing = await findBySourceKey('massException', item.sourceKey)
  await upsert('massException', item.sourceKey, {
    scope: item.scope ?? 'singleOccurrence',
    schedule: await resolveReference('recurringMassSchedule', item.scheduleKey),
    occurrenceDate: item.occurrenceDate,
    rangeStart: item.rangeStart,
    rangeEnd: item.rangeEnd,
    changeType: item.changeType,
    newStartsAt: item.newStartsAt,
    newEndsAt: item.newEndsAt,
    newPlace: await resolveReference('place', item.newPlaceKey, false),
    relatedEvent: await resolveReference('event', item.relatedEventKey, false),
    titleOverride: item.titleOverride,
    publicNote: item.publicNote,
    details: toPortableText(item.details, item.sourceKey),
    sourceBulletins: await sourceBulletinReferences(
      existing,
      item.sourceBulletinKeys,
      item.sourceKey,
    ),
  })
}

for (const item of manifest.massTexts ?? []) {
  await upsert('massText', item.sourceKey, {
    title: item.title,
    massDate: item.massDate,
    massSchedule: await resolveReference('recurringMassSchedule', item.scheduleKey),
    body: toPortableText(item.body, item.sourceKey),
    sourceBulletin: await resolveReference('bulletin', item.bulletinKey),
  })
}

for (const item of manifest.articles ?? []) {
  const existing = await findBySourceKey('article', item.sourceKey)
  let mainImage
  if (item.imagePath) {
    const imagePath = resolveFilePath(item.imagePath, baseDirectory)
    const imageAsset = await client.assets.upload('image', fs.createReadStream(imagePath), {
      filename: item.imageFilename ?? imagePath.split(/[\\/]/).at(-1),
    })
    mainImage = {
      _type: 'image',
      asset: {_type: 'reference', _ref: imageAsset._id},
      alt: item.imageAlt,
    }
  } else if (item.imagePath === null) {
    mainImage = null
  }
  await upsert('article', item.sourceKey, {
    title: item.title,
    slug: {_type: 'slug', current: item.slug ?? slugify(item.title)},
    articleType: item.articleType ?? 'other',
    publishedAt: item.publishedAt,
    category: item.category,
    mainImage,
    summary: item.summary,
    body: toPortableText(item.body, item.sourceKey),
    places: (await resolveReferences('place', item.placeKeys)).map((reference, index) => ({
      ...reference,
      _key: stableKey(item.sourceKey, 'place', index, reference._ref),
    })),
    relatedEvents: (await resolveReferences('event', item.relatedEventKeys)).map(
      (reference, index) => ({
        ...reference,
        _key: stableKey(item.sourceKey, 'event', index, reference._ref),
      }),
    ),
    links: toLinks(item.links, item.sourceKey),
    sourceBulletins: await sourceBulletinReferences(
      existing,
      item.sourceBulletinKeys,
      item.sourceKey,
    ),
  })
}

console.log('Import fullført.')
