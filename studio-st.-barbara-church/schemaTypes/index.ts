import {actionLink} from './objects/actionLink'
import {bulletinRevision} from './objects/bulletinRevision'
import {richText} from './objects/richText'
import {announcement} from './documents/announcement'
import {article} from './documents/article'
import {bulletin} from './documents/bulletin'
import {event} from './documents/event'
import {massException} from './documents/massException'
import {massText} from './documents/massText'
import {place} from './documents/place'
import {recurringMassSchedule} from './documents/recurringMassSchedule'
import {translatedCopy, translationsField} from './objects/translatedCopy'

export const schemaTypes = [
  actionLink,
  bulletinRevision,
  richText,
  translatedCopy,
  place,
  bulletin,
  article,
  event,
  announcement,
  recurringMassSchedule,
  massException,
  massText,
].map((schema) => 'fields' in schema && ['place', 'article', 'event', 'announcement', 'recurringMassSchedule', 'massException'].includes(schema.name)
  ? {...schema, fields: [...schema.fields, translationsField]}
  : schema)
