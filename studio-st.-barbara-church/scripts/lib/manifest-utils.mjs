import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const COLLECTIONS = [
  ['bulletins', 'bulletin'],
  ['places', 'place'],
  ['massSchedules', 'recurringMassSchedule'],
  ['events', 'event'],
  ['announcements', 'announcement'],
  ['massExceptions', 'massException'],
  ['massTexts', 'massText'],
  ['articles', 'article'],
]

export function readManifest(manifestPath) {
  const absolutePath = path.resolve(manifestPath)
  const manifest = JSON.parse(fs.readFileSync(absolutePath, 'utf8'))
  return {manifest, absolutePath, baseDirectory: path.dirname(absolutePath)}
}

export function collectionDefinitions() {
  return COLLECTIONS
}

export function allManifestItems(manifest) {
  return COLLECTIONS.flatMap(([collection, type]) =>
    (manifest[collection] ?? []).map((item) => ({collection, type, item})),
  )
}

export function validateManifest(manifest, baseDirectory) {
  const errors = []

  if (manifest.schemaVersion !== 1) {
    errors.push('schemaVersion må være 1.')
  }

  for (const [collection] of COLLECTIONS) {
    if (manifest[collection] !== undefined && !Array.isArray(manifest[collection])) {
      errors.push(`${collection} må være en liste.`)
    }
  }

  for (const [collection, type] of COLLECTIONS) {
    const keys = new Set()
    for (const [index, item] of (manifest[collection] ?? []).entries()) {
      if (!item || typeof item !== 'object') {
        errors.push(`${collection}[${index}] må være et objekt.`)
        continue
      }
      if (typeof item.sourceKey !== 'string' || !item.sourceKey.trim()) {
        errors.push(`${collection}[${index}] mangler sourceKey.`)
      } else if (keys.has(item.sourceKey)) {
        if (type !== 'bulletin') errors.push(`${collection} har duplikatnøkkel ${item.sourceKey}.`)
      } else {
        keys.add(item.sourceKey)
      }
    }
  }

  for (const [index, bulletin] of (manifest.bulletins ?? []).entries()) {
    for (const field of ['issueDate', 'coversFrom', 'coversUntil', 'pdfPath']) {
      if (!bulletin[field]) errors.push(`bulletins[${index}] mangler ${field}.`)
    }
    if (bulletin.coversFrom && bulletin.coversUntil && bulletin.coversUntil < bulletin.coversFrom) {
      errors.push(`bulletins[${index}] har coversUntil før coversFrom.`)
    }
    if (bulletin.pdfPath) {
      const pdfPath = resolveFilePath(bulletin.pdfPath, baseDirectory)
      if (!fs.existsSync(pdfPath)) errors.push(`PDF finnes ikke: ${pdfPath}`)
      if (path.extname(pdfPath).toLowerCase() !== '.pdf') errors.push(`Ikke en PDF: ${pdfPath}`)
    }
    if (bulletin.previousVersions !== undefined && !Array.isArray(bulletin.previousVersions)) {
      errors.push(`bulletins[${index}].previousVersions må være en liste.`)
    }
    for (const [revisionIndex, revision] of (bulletin.previousVersions ?? []).entries()) {
      if (!revision?.pdfPath) {
        errors.push(`bulletins[${index}].previousVersions[${revisionIndex}] mangler pdfPath.`)
        continue
      }
      const pdfPath = resolveFilePath(revision.pdfPath, baseDirectory)
      if (!fs.existsSync(pdfPath)) errors.push(`Tidligere PDF finnes ikke: ${pdfPath}`)
      if (path.extname(pdfPath).toLowerCase() !== '.pdf') {
        errors.push(`Tidligere versjon er ikke en PDF: ${pdfPath}`)
      }
    }
  }

  for (const event of manifest.events ?? []) {
    if (event.promotionFrom || event.promotionUntil) {
      const from = Date.parse(event.promotionFrom)
      const until = Date.parse(event.promotionUntil)
      if (!Number.isFinite(from) || !Number.isFinite(until) || until <= from) {
        errors.push(`Hendelsen ${event.sourceKey} må ha gyldig start og slutt for fremheving.`)
      }
    }
    if (!event.title || !event.startsAt)
      errors.push(`Hendelsen ${event.sourceKey} mangler tittel/start.`)
    if (event.endsAt && event.endsAt < event.startsAt) {
      errors.push(`Hendelsen ${event.sourceKey} slutter før den starter.`)
    }
  }

  for (const schedule of manifest.massSchedules ?? []) {
    for (const field of [
      'title',
      'placeKey',
      'language',
      'anchorWeekday',
      'recurrenceType',
      'startTime',
      'validFrom',
    ]) {
      if (schedule[field] === undefined) {
        errors.push(`Messeplanen ${schedule.sourceKey} mangler ${field}.`)
      }
    }
  }

  for (const announcement of manifest.announcements ?? []) {
    if (!announcement.title || !announcement.body) {
      errors.push(`Kunngjøringen ${announcement.sourceKey} mangler tittel eller innhold.`)
    }
    if (!announcement.publishedAt) {
      errors.push(`Kunngjøringen ${announcement.sourceKey} mangler publishedAt.`)
    }
    if (announcement.appliesFrom && announcement.appliesUntil) {
      if (announcement.appliesUntil < announcement.appliesFrom) {
        errors.push(`Kunngjøringen ${announcement.sourceKey} har ugyldig periode.`)
      }
    }
  }

  for (const exception of manifest.massExceptions ?? []) {
    if (!exception.scheduleKey || !exception.changeType) {
      errors.push(`Messeavviket ${exception.sourceKey} mangler plan eller endringstype.`)
    }
    if (exception.scope === 'dateRange') {
      if (!exception.rangeStart || !exception.rangeEnd) {
        errors.push(`Messeavviket ${exception.sourceKey} mangler datointervall.`)
      }
    } else if (!exception.occurrenceDate) {
      errors.push(`Messeavviket ${exception.sourceKey} mangler occurrenceDate.`)
    }
  }

  for (const massText of manifest.massTexts ?? []) {
    if (!massText.massDate || !massText.scheduleKey || !massText.bulletinKey || !massText.body) {
      errors.push(`Messeteksten ${massText.sourceKey} mangler dato, messe, kilde eller tekst.`)
    }
  }

  for (const article of manifest.articles ?? []) {
    if (!article.title || !article.publishedAt || !article.body) {
      errors.push(`Artikkelen ${article.sourceKey} mangler tittel, publiseringsdato eller innhold.`)
    }
    if (article.imagePath) {
      const imagePath = resolveFilePath(article.imagePath, baseDirectory)
      if (!fs.existsSync(imagePath)) errors.push(`Artikkelbilde finnes ikke: ${imagePath}`)
      if (!article.imageAlt) errors.push(`Artikkelen ${article.sourceKey} mangler imageAlt.`)
    }
  }

  return errors
}

export function resolveFilePath(filePath, baseDirectory) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(baseDirectory, filePath)
}

export function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
}

export function stableKey(...parts) {
  return crypto
    .createHash('sha1')
    .update(parts.filter((part) => part !== undefined).join('|'))
    .digest('hex')
    .slice(0, 12)
}

export function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[æÆ]/g, 'ae')
    .replace(/[øØ]/g, 'o')
    .replace(/[åÅ]/g, 'a')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

export function toPortableText(value, sourceKey) {
  if (!value) return undefined
  const items = Array.isArray(value) ? value : [value]

  return items.map((item, index) => {
    if (item && typeof item === 'object' && item._type === 'block') return item

    const text = typeof item === 'string' ? item : String(item.text ?? '')
    const style = typeof item === 'object' && item.style ? item.style : 'normal'

    return {
      _type: 'block',
      _key: stableKey(sourceKey, index, style, text),
      style,
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: stableKey(sourceKey, index, 'span', text),
          marks: [],
          text,
        },
      ],
    }
  })
}

export function toLinks(links, sourceKey) {
  return (links ?? []).map((link, index) => ({
    _type: 'actionLink',
    _key: stableKey(sourceKey, 'link', index, link.label, link.url),
    label: link.label,
    url: link.url,
  }))
}

export function uniqueReferences(references) {
  const seen = new Set()
  return references.filter((reference) => {
    if (!reference?._ref || seen.has(reference._ref)) return false
    seen.add(reference._ref)
    return true
  })
}
