import {CalendarIcon} from '@sanity/icons/Calendar'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {sourceKeyField} from '../shared/sourceKeyField'

const changeLabels: Record<string, string> = {
  cancelled: 'Avlyst',
  rescheduled: 'Flyttet',
  changed: 'Endret informasjon',
}

export const massException = defineType({
  name: 'massException',
  title: 'Messeavvik',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    sourceKeyField,
    defineField({
      name: 'scope',
      title: 'Omfang',
      type: 'string',
      initialValue: 'singleOccurrence',
      options: {
        layout: 'radio',
        list: [
          {title: 'Én messe', value: 'singleOccurrence'},
          {title: 'Datointervall', value: 'dateRange'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'schedule',
      title: 'Fast messeplan',
      type: 'reference',
      to: [{type: 'recurringMassSchedule'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'occurrenceDate',
      title: 'Opprinnelig dato',
      description: 'Datoen som ville blitt beregnet fra den faste messeplanen.',
      type: 'date',
      hidden: ({document}) => document?.scope === 'dateRange',
      validation: (rule) =>
        rule.custom((occurrenceDate, context) => {
          if (context.document?.scope === 'dateRange') return true
          return typeof occurrenceDate === 'string' || 'Opprinnelig dato er påkrevd.'
        }),
    }),
    defineField({
      name: 'rangeStart',
      title: 'Fra og med',
      type: 'date',
      hidden: ({document}) => document?.scope !== 'dateRange',
      validation: (rule) =>
        rule.custom((rangeStart, context) => {
          if (context.document?.scope !== 'dateRange') return true
          return typeof rangeStart === 'string' || 'Startdato er påkrevd.'
        }),
    }),
    defineField({
      name: 'rangeEnd',
      title: 'Til og med',
      type: 'date',
      hidden: ({document}) => document?.scope !== 'dateRange',
      validation: (rule) =>
        rule.custom((rangeEnd, context) => {
          if (context.document?.scope !== 'dateRange') return true
          const rangeStart = context.document?.rangeStart
          if (typeof rangeEnd !== 'string') return 'Sluttdato er påkrevd.'
          if (typeof rangeStart !== 'string') return true
          return rangeEnd >= rangeStart || 'Sluttdato må være lik eller etter startdato.'
        }),
    }),
    defineField({
      name: 'changeType',
      title: 'Hva er endret?',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          {title: 'Avlyst', value: 'cancelled'},
          {title: 'Flyttet', value: 'rescheduled'},
          {title: 'Annen endring', value: 'changed'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'newStartsAt',
      title: 'Nytt starttidspunkt',
      type: 'datetime',
      hidden: ({document}) => document?.changeType === 'cancelled',
      validation: (rule) =>
        rule.custom((newStartsAt, context) => {
          if (context.document?.scope === 'dateRange') return true
          if (context.document?.changeType !== 'rescheduled') return true
          return (
            typeof newStartsAt === 'string' || 'Nytt starttidspunkt er påkrevd når messen flyttes.'
          )
        }),
    }),
    defineField({
      name: 'newEndsAt',
      title: 'Nytt sluttidspunkt',
      type: 'datetime',
      hidden: ({document}) => document?.changeType === 'cancelled',
      validation: (rule) =>
        rule.custom((newEndsAt, context) => {
          const newStartsAt = context.document?.newStartsAt
          if (typeof newEndsAt !== 'string' || typeof newStartsAt !== 'string') return true
          return new Date(newEndsAt) >= new Date(newStartsAt) || 'Slutt må være etter start.'
        }),
    }),
    defineField({
      name: 'newPlace',
      title: 'Nytt sted',
      type: 'reference',
      to: [{type: 'place'}],
      hidden: ({document}) => document?.changeType === 'cancelled',
    }),
    defineField({
      name: 'relatedEvent',
      title: 'Relatert hendelse',
      description: 'For eksempel pilegrimsturen som den endrede messen inngår i.',
      type: 'reference',
      to: [{type: 'event'}],
    }),
    defineField({
      name: 'titleOverride',
      title: 'Ny tittel',
      description: 'Valgfritt, for eksempel ved en særskilt høytid.',
      type: 'string',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'publicNote',
      title: 'Offentlig merknad',
      description: 'Vises sammen med den avlyste eller endrede messen i tidslinjen.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'details',
      title: 'Flere detaljer',
      type: 'richText',
    }),
    defineField({
      name: 'sourceBulletins',
      title: 'Kildesøndagsblader',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'bulletin'}]})],
      validation: (rule) => rule.unique(),
    }),
  ],
  orderings: [
    {
      title: 'Neste først',
      name: 'occurrenceDateAsc',
      by: [{field: 'occurrenceDate', direction: 'asc'}],
    },
    {
      title: 'Nyeste først',
      name: 'occurrenceDateDesc',
      by: [{field: 'occurrenceDate', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      schedule: 'schedule.title',
      occurrenceDate: 'occurrenceDate',
      rangeStart: 'rangeStart',
      rangeEnd: 'rangeEnd',
      scope: 'scope',
      changeType: 'changeType',
    },
    prepare({schedule, occurrenceDate, rangeStart, rangeEnd, scope, changeType}) {
      const dateLabel =
        scope === 'dateRange' ? `${rangeStart ?? '?'}–${rangeEnd ?? '?'}` : occurrenceDate
      return {
        title: `${changeLabels[changeType] ?? 'Endring'}: ${schedule ?? 'Ukjent messeplan'}`,
        subtitle: dateLabel,
      }
    },
  },
})
