import { defineQuery } from "next-sanity";

const placeProjection = /* groq */ `{
  _id,
  sourceKey,
  name,
  "slug": slug.current,
  placeType,
  streetAddress,
  postalCode,
  locality,
  mapUrl
}`;

const bulletinProjection = /* groq */ `{
  _id,
  issueDate,
  coversFrom,
  coversUntil,
  "pdfUrl": pdf.asset->url
}`;

const imageProjection = /* groq */ `{
  "assetRef": asset._ref,
  alt,
  crop,
  hotspot,
  "lqip": asset->metadata.lqip,
  "dimensions": asset->metadata.dimensions
}`;

export const CALENDAR_DATA_QUERY = defineQuery(/* groq */ `
  {
    "schedules": *[
      _type == "recurringMassSchedule" &&
      (status == "active" || validUntil >= $startDate) &&
      validFrom <= $endDate
    ] | order(startTime asc) {
      _id,
      sourceKey,
      title,
      status,
      place->${placeProjection},
      language,
      anchorWeekday,
      recurrenceType,
      weeksOfMonth,
      dayOffset,
      startTime,
      durationMinutes,
      validFrom,
      validUntil,
      notes
    },
    "exceptions": *[
      _type == "massException" &&
      (
        (scope == "singleOccurrence" && occurrenceDate >= $startDate && occurrenceDate <= $endDate) ||
        (scope == "dateRange" && rangeEnd >= $startDate && rangeStart <= $endDate)
      )
    ] {
      _id,
      sourceKey,
      scope,
      "scheduleKey": schedule->sourceKey,
      occurrenceDate,
      rangeStart,
      rangeEnd,
      changeType,
      newStartsAt,
      newEndsAt,
      newPlace->${placeProjection},
      "relatedEventSlug": relatedEvent->slug.current,
      titleOverride,
      publicNote,
      details,
      sourceBulletins[]->${bulletinProjection}
    },
    "events": *[
      _type == "event" &&
      startsAt <= $end &&
      coalesce(endsAt, startsAt) >= $start
    ] | order(startsAt asc) {
      _id,
      sourceKey,
      title,
      "slug": slug.current,
      eventType,
      status,
      startsAt,
      endsAt,
      places[]->${placeProjection},
      parentEvent->{title, "slug": slug.current},
      summary,
      body,
      language,
      registrationDeadline,
      links[]{_key, label, url},
      sourceBulletins[]->${bulletinProjection}
    },
    "bulletins": *[
      _type == "bulletin" &&
      coversUntil >= $startDate &&
      coversFrom <= $endDate
    ] | order(issueDate desc) ${bulletinProjection}
  }
`);

export const PARISH_PLACES_QUERY = defineQuery(/* groq */ `
  *[
    _type == "place" &&
    sourceKey in [
      "place:kongsberg-st-barbara",
      "place:notodden",
      "place:rjukan-st-johannes",
      "place:mo-kirke"
    ]
  ] | order(sourceKey asc) ${placeProjection}
`);

export const ACTIVE_ANNOUNCEMENTS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "announcement" &&
    status == "active" &&
    (!defined(appliesUntil) || appliesUntil >= $now)
  ] | order(lastMentionedAt desc, publishedAt desc) {
    _id,
    sourceKey,
    title,
    "slug": slug.current,
    status,
    priority,
    publishedAt,
    lastMentionedAt,
    appliesFrom,
    appliesUntil,
    summary,
    body,
    places[]->${placeProjection},
    relatedEvents[]->{title, "slug": slug.current},
    links[]{_key, label, url},
    sourceBulletins[]->${bulletinProjection}
  }
`);

export const ANNOUNCEMENTS_BY_BULLETINS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "announcement" &&
    count(sourceBulletins[@._ref in $bulletinIds]) > 0
  ] | order(priority desc, publishedAt desc) {
    _id,
    sourceKey,
    title,
    "slug": slug.current,
    status,
    priority,
    publishedAt,
    lastMentionedAt,
    appliesFrom,
    appliesUntil,
    summary,
    body,
    places[]->${placeProjection},
    relatedEvents[]->{title, "slug": slug.current},
    links[]{_key, label, url},
    sourceBulletins[]->${bulletinProjection}
  }
`);

export const LATEST_BULLETINS_QUERY = defineQuery(/* groq */ `
  *[_type == "bulletin"] | order(issueDate desc)[0...3] ${bulletinProjection}
`);

export const LATEST_ARTICLES_QUERY = defineQuery(/* groq */ `
  *[_type == "article" && defined(slug.current)]
  | order(publishedAt desc)[0...4] {
    _id,
    sourceKey,
    title,
    "slug": slug.current,
    articleType,
    category,
    publishedAt,
    summary,
    mainImage ${imageProjection}
  }
`);

export const ALL_ARTICLES_QUERY = defineQuery(/* groq */ `
  *[_type == "article" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    sourceKey,
    title,
    "slug": slug.current,
    articleType,
    category,
    publishedAt,
    summary,
    mainImage ${imageProjection}
  }
`);

export const ARTICLE_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "article" && defined(slug.current)]{"slug": slug.current}
`);

export const ARTICLE_QUERY = defineQuery(/* groq */ `
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    sourceKey,
    title,
    "slug": slug.current,
    articleType,
    category,
    publishedAt,
    summary,
    mainImage ${imageProjection},
    body,
    places[]->${placeProjection},
    relatedEvents[]->{title, "slug": slug.current},
    links[]{_key, label, url},
    sourceBulletins[]->${bulletinProjection}
  }
`);

export const EVENT_QUERY = defineQuery(/* groq */ `
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    sourceKey,
    title,
    "slug": slug.current,
    eventType,
    status,
    startsAt,
    endsAt,
    places[]->${placeProjection},
    parentEvent->{title, "slug": slug.current},
    summary,
    body,
    language,
    registrationDeadline,
    links[]{_key, label, url},
    sourceBulletins[]->${bulletinProjection}
  }
`);

export const MASS_TEXT_QUERY = defineQuery(/* groq */ `
  *[
    _type == "massText" &&
    massDate == $date &&
    massSchedule->sourceKey == $scheduleKey
  ][0] {
    _id,
    title,
    body
  }
`);
