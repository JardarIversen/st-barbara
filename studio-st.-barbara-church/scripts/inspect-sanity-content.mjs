import {getSanityClient} from './lib/sanity-client.mjs'

const asJson = process.argv.includes('--json')
const client = getSanityClient()
const documents = await client.fetch(`
  *[_type in [
    "bulletin",
    "place",
    "recurringMassSchedule",
    "event",
    "announcement",
    "massException",
    "massText",
    "article"
  ]] | order(_type asc, coalesce(issueDate, startsAt, publishedAt, title, name) asc) {
    _id,
    _type,
    sourceKey,
    title,
    name,
    issueDate,
    publishedAt,
    lastMentionedAt,
    appliesFrom,
    startsAt,
    endsAt,
    appliesUntil,
    summary,
    publicNote,
    status,
    priority,
    eventType,
    language,
    anchorWeekday,
    recurrenceType,
    weeksOfMonth,
    dayOffset,
    startTime,
    validFrom,
    validUntil,
    scope,
    occurrenceDate,
    massDate,
    rangeStart,
    rangeEnd,
    changeType,
    revision,
    "place": place->{sourceKey, name},
    "places": places[]->{sourceKey, name},
    "schedule": schedule->{sourceKey, title},
    "massSchedule": massSchedule->{sourceKey, title},
    "sourceBulletins": sourceBulletins[]->sourceKey,
    "sourceBulletin": sourceBulletin->sourceKey,
    "bodyText": body[].children[].text,
    "detailsText": details[].children[].text
  }
`)

if (asJson) {
  console.log(JSON.stringify(documents, null, 2))
  process.exit(0)
}

let currentType
for (const document of documents) {
  if (document._type !== currentType) {
    currentType = document._type
    console.log(`\n${currentType}`)
  }
  const label =
    document.title ??
    document.name ??
    document.issueDate ??
    document.schedule?.title ??
    document.massSchedule?.title ??
    '(uten tittel)'
  const detail =
    document.startsAt ??
    document.occurrenceDate ??
    document.massDate ??
    (document.rangeStart ? `${document.rangeStart}–${document.rangeEnd}` : undefined) ??
    document.appliesUntil ??
    document.status ??
    ''
  console.log(`- ${document.sourceKey} | ${label}${detail ? ` | ${detail}` : ''}`)
}

console.log(`\n${documents.length} dokumenter.`)
