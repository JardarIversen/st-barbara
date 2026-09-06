import {stableKey, toLinks, toPortableText} from './manifest-utils.mjs'
import {sourceFingerprint} from '../../../web/src/i18n/translation-source.mjs'

export const translatedFields = [
  'title',
  'titleOverride',
  'name',
  'category',
  'mainImageAlt',
  'summary',
  'notes',
  'publicNote',
  'body',
  'details',
  'links',
]

export function translationErrors(value, type) {
  if (value === undefined) return []
  if (
    ![
      'place',
      'article',
      'event',
      'announcement',
      'recurringMassSchedule',
      'massException',
    ].includes(type)
  )
    return ['Denne datatypen skal beholde originalspråket.']
  if (value === null) return []
  if (
    !value ||
    Array.isArray(value) ||
    typeof value !== 'object' ||
    Object.keys(value).some((key) => key !== 'en')
  )
    return ['translations må være et objekt med en valgfri en-nøkkel.']
  const copy = value.en
  if (!copy || typeof copy !== 'object' || Array.isArray(copy))
    return ['translations.en må være et objekt.']
  const errors = Object.keys(copy)
    .filter((key) => !translatedFields.includes(key))
    .map((key) => `Kan ikke oversette feltet ${key}.`)
  for (const [field, text] of Object.entries(copy)) {
    if (text === null) continue
    if (['body', 'details'].includes(field)) {
      if (typeof text !== 'string' && !Array.isArray(text))
        errors.push(`${field} må være tekst eller Portable Text.`)
    } else if (field === 'links') {
      if (
        !Array.isArray(text) ||
        text.some(
          (link) =>
            !link ||
            typeof link.label !== 'string' ||
            !link.label ||
            typeof link.url !== 'string' ||
            !link.url,
        )
      )
        errors.push('links må inneholde label og url.')
    } else if (typeof text !== 'string') errors.push(`${field} må være tekst.`)
  }
  return errors
}

export function prepareTranslations(existing, fields, incoming, sourceKey) {
  if (incoming === null) return []
  if (!existing?.translations?.length && !incoming) return undefined
  const translations = structuredClone(existing?.translations ?? [])
  // Do not keep an English statement when the Norwegian source was changed.
  for (const row of translations) {
    for (const field of translatedFields) {
      const source = field === 'mainImageAlt' ? fields.mainImage?.alt : fields[field]
      const previous = field === 'mainImageAlt' ? existing?.mainImage?.alt : existing?.[field]
      if (source !== undefined && sourceFingerprint(source) !== sourceFingerprint(previous)) {
        delete row.value[field]
        if (row.value.sourceHashes) delete row.value.sourceHashes[field]
      }
    }
  }
  if (incoming?.en) {
    let row = translations.find((item) => item.language === 'en')
    if (!row) {
      row = {
        _key: stableKey(sourceKey, 'translation', 'en'),
        _type: 'internationalizedArrayTranslatedCopyValue',
        language: 'en',
        value: {_type: 'translatedCopy'},
      }
      translations.push(row)
    }
    for (const [field, value] of Object.entries(incoming.en)) {
      if (!translatedFields.includes(field)) throw new Error(`Kan ikke oversette ${field}`)
      if (value === null) {
        delete row.value[field]
        if (row.value.sourceHashes) delete row.value.sourceHashes[field]
        continue
      }
      row.value[field] = ['body', 'details'].includes(field)
        ? toPortableText(value, `${sourceKey}:en:${field}`)
        : field === 'links'
          ? toLinks(value, `${sourceKey}:en`)
          : value
      const source =
        field === 'mainImageAlt'
          ? (fields.mainImage?.alt ?? existing?.mainImage?.alt)
          : fields[field] !== undefined
            ? fields[field]
            : existing?.[field]
      row.value.sourceHashes = {...row.value.sourceHashes, [field]: sourceFingerprint(source)}
    }
  }
  return translations
}
