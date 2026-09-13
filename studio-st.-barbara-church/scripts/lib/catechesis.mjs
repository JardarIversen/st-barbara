import {prepareTranslations, translationErrors} from './translations.mjs'
import {toPortableText} from './manifest-utils.mjs'
import {catechesisErrors} from './catechesis-validation.mjs'

export function prepareCatechesis(value, existing, sourceKey) {
  if (value == null) return value
  const errors = catechesisErrors(value)
  if (errors.length) throw new Error(errors.join('\n'))
  function copy(item, previous, type, key, extra = {}) {
    const errors = translationErrors(item.translations, 'article')
    if (errors.length) throw new Error(`${key}: ${errors.join(', ')}`)
    const fields = {
      _type: type, ...(item._key ? {_key: item._key} : {}),
      title: item.title, summary: item.summary,
      body: toPortableText(item.body, key), ...extra,
    }
    const translations = prepareTranslations(previous, fields, item.translations, key)
    return {...fields, ...(translations ? {translations} : {})}
  }
  return copy(value, existing, 'catechesisProgram', sourceKey, {
    groups: value.groups.map(group => {
      const previous = existing?.groups?.find(item => item._key === group._key)
      const key = `${sourceKey}:${group._key}`
      return copy(group, previous, 'catechesisGroup', key, {
        contact: group.contact,
        sessionDates: group.sessionDates,
        sessions: group.sessions.map(session => copy(session, previous?.sessions?.find(item => item._key === session._key), 'catechesisSession', `${key}:${session._key}`, {
          startTime: session.startTime, endTime: session.endTime, massTime: session.massTime,
          communionYear: session.communionYear, communionDate: session.communionDate,
        })),
      })
    }),
    otherOfferings: (value.otherOfferings ?? []).map(item => copy(item, existing?.otherOfferings?.find(previous => previous._key === item._key), 'catechesisOffering', `${sourceKey}:${item._key}`, {contact: item.contact})),
  })
}
