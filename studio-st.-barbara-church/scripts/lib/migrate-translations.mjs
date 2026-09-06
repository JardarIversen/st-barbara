import {sourceFingerprint} from '../../../web/src/i18n/translation-source.mjs'
import {stableKey} from './manifest-utils.mjs'

export const CONTENT_TYPES = [
  'place',
  'article',
  'event',
  'announcement',
  'recurringMassSchedule',
  'massException',
]
export const COPY_FIELDS = [
  'title',
  'titleOverride',
  'name',
  'category',
  'summary',
  'notes',
  'publicNote',
  'body',
  'details',
  'links',
  'mainImageAlt',
]

export function planTranslation(document, dictionary) {
  const translations = structuredClone(document.translations ?? [])
  let english = translations.find((row) => row.language === 'en')
  if (!english) {
    english = {
      _key: stableKey(document.sourceKey ?? document._id, 'translation', 'en'),
      _type: 'internationalizedArrayTranslatedCopyValue',
      language: 'en',
      value: {_type: 'translatedCopy'},
    }
    translations.push(english)
  }
  const missing = []
  const added = []
  function translate(value, key = '') {
    if (typeof value === 'string' && ['', 'text', 'label', 'alt'].includes(key)) {
      if (!value.trim()) return value
      if (Object.hasOwn(dictionary, value)) return dictionary[value]
      missing.push(value)
      return value
    }
    if (Array.isArray(value)) return value.map((item) => translate(item, key))
    if (value && typeof value === 'object')
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, translate(v, k)]))
    return value
  }
  for (const field of COPY_FIELDS) {
    const original = field === 'mainImageAlt' ? document.mainImage?.alt : document[field]
    if (original === undefined || original === null || original === '') continue
    // Existing editorial translations always win; never overwrite or certify them.
    if (english.value[field] !== undefined) continue
    english.value[field] = translate(original)
    english.value.sourceHashes = {
      ...english.value.sourceHashes,
      [field]: sourceFingerprint(original),
    }
    added.push(field)
  }
  return {id: document._id, rev: document._rev, translations, added, missing: [...new Set(missing)]}
}
