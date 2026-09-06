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

export const schemaTypes = [
  actionLink,
  bulletinRevision,
  richText,
  place,
  bulletin,
  article,
  event,
  announcement,
  recurringMassSchedule,
  massException,
  massText,
]
