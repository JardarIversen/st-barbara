import {CalendarIcon} from '@sanity/icons/Calendar'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {sourceKeyField} from '../shared/sourceKeyField'

const eventTypeLabels: Record<string, string> = {
  mass: 'Messe',
  parishCouncil: 'Menighetsråd',
  pilgrimage: 'Pilegrimstur',
  activity: 'Aktivitet',
  social: 'Sosialt arrangement',
  other: 'Annet',
}

const statusLabels: Record<string, string> = {
  scheduled: 'Planlagt',
  cancelled: 'Avlyst',
  postponed: 'Utsatt',
}

function formatDateTime(value?: string) {
  if (!value) return undefined
  return new Intl.DateTimeFormat('nb-NO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Oslo',
  }).format(new Date(value))
}

export const event = defineType({
  name: 'event',
  title: 'Hendelse',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    sourceKeyField,
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'slug',
      title: 'Nettadresse-ID',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'eventType',
      title: 'Type hendelse',
      type: 'string',
      initialValue: 'other',
      options: {
        layout: 'radio',
        list: [
          {title: 'Messe', value: 'mass'},
          {title: 'Menighetsråd', value: 'parishCouncil'},
          {title: 'Pilegrimstur', value: 'pilgrimage'},
          {title: 'Aktivitet', value: 'activity'},
          {title: 'Sosialt arrangement', value: 'social'},
          {title: 'Annet', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'scheduled',
      options: {
        layout: 'radio',
        list: [
          {title: 'Planlagt', value: 'scheduled'},
          {title: 'Avlyst', value: 'cancelled'},
          {title: 'Utsatt', value: 'postponed'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startsAt',
      title: 'Starter',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endsAt',
      title: 'Slutter',
      description: 'Valgfritt. Kan være flere dager etter start.',
      type: 'datetime',
      validation: (rule) =>
        rule.custom((endsAt, context) => {
          const startsAt = context.document?.startsAt
          if (typeof endsAt !== 'string' || typeof startsAt !== 'string') return true
          return new Date(endsAt) >= new Date(startsAt) || 'Slutt må være etter start.'
        }),
    }),
    defineField({
      name: 'places',
      title: 'Steder',
      description: 'Legg hovedstedet først. Underhendelser kan ha egne steder.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'place'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'parentEvent',
      title: 'Overordnet hendelse',
      description: 'Brukes for eksempel når en messe hører til en pilegrimstur.',
      type: 'reference',
      to: [{type: 'event'}],
      validation: (rule) =>
        rule.custom((parentEvent, context) => {
          const currentId = context.document?._id?.replace(/^drafts\./, '')
          const parentId = parentEvent?._ref?.replace(/^drafts\./, '')
          return (
            !currentId || parentId !== currentId || 'En hendelse kan ikke være sin egen forelder.'
          )
        }),
    }),
    defineField({
      name: 'summary',
      title: 'Kort beskrivelse',
      description: 'Korttekst til tidslinje og oversikter.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(280).warning('Hold kortteksten under 280 tegn.'),
    }),
    defineField({
      name: 'body',
      title: 'Detaljer',
      type: 'richText',
    }),
    defineField({
      name: 'language',
      title: 'Messespråk',
      type: 'string',
      hidden: ({document}) => document?.eventType !== 'mass',
      options: {
        layout: 'radio',
        list: [
          {title: 'Norsk', value: 'nb'},
          {title: 'Engelsk', value: 'en'},
          {title: 'Polsk', value: 'pl'},
          {title: 'Spansk', value: 'es'},
          {title: 'Ukrainsk', value: 'uk'},
          {title: 'Annet', value: 'other'},
        ],
      },
    }),
    defineField({
      name: 'registrationDeadline',
      title: 'Påmeldingsfrist',
      type: 'datetime',
    }),
    defineField({
      name: 'promotionFrom',
      title: 'Fremhev fra',
      description: 'Valgfri periode under Kunngjøringer. Uten periode vises hendelser med påmeldingsfrist automatisk frem til fristen.',
      type: 'datetime',
      validation: (rule) => rule.custom((value, context) =>
        context.document?.promotionUntil && !value ? 'Velg start for fremhevingen.' : true),
    }),
    defineField({
      name: 'promotionUntil',
      title: 'Fremhev til',
      description: 'Perioden erstatter automatisk fremheving. Avlyste, utsatte og avsluttede hendelser vises ikke.',
      type: 'datetime',
      validation: (rule) => rule.custom((value, context) => {
        const from = context.document?.promotionFrom
        if (from && !value) return 'Velg slutt for fremhevingen.'
        if (typeof from === 'string' && typeof value === 'string' && new Date(value) <= new Date(from)) return 'Slutt må være etter start.'
        return true
      }),
    }),
    defineField({
      name: 'links',
      title: 'Lenker',
      type: 'array',
      of: [defineArrayMember({type: 'actionLink'})],
    }),
    defineField({
      name: 'sourceBulletins',
      title: 'Kildesøndagsblader',
      description: 'Samme hendelse kan omtales i flere søndagsblader.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'bulletin'}]})],
      validation: (rule) => rule.unique(),
    }),
  ],
  orderings: [
    {
      title: 'Neste først',
      name: 'startsAtAsc',
      by: [{field: 'startsAt', direction: 'asc'}],
    },
    {
      title: 'Nyeste først',
      name: 'startsAtDesc',
      by: [{field: 'startsAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      eventType: 'eventType',
      status: 'status',
      startsAt: 'startsAt',
    },
    prepare({title, eventType, status, startsAt}) {
      const typeLabel = eventTypeLabels[eventType] ?? 'Hendelse'
      const statusLabel = statusLabels[status] ?? 'Ukjent status'
      const date = formatDateTime(startsAt)

      return {
        title: status === 'cancelled' ? `Avlyst: ${title}` : title,
        subtitle: [typeLabel, statusLabel, date].filter(Boolean).join(' · '),
      }
    },
  },
})
