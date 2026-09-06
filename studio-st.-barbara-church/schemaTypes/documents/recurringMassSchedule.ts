import {ClockIcon} from '@sanity/icons/Clock'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {sourceKeyField} from '../shared/sourceKeyField'

const weekdayLabels: Record<string, string> = {
  monday: 'Mandag',
  tuesday: 'Tirsdag',
  wednesday: 'Onsdag',
  thursday: 'Torsdag',
  friday: 'Fredag',
  saturday: 'Lørdag',
  sunday: 'Søndag',
}

const languageLabels: Record<string, string> = {
  nb: 'Norsk',
  en: 'Engelsk',
  pl: 'Polsk',
  es: 'Spansk',
  uk: 'Ukrainsk',
  other: 'Annet språk',
}

export const recurringMassSchedule = defineType({
  name: 'recurringMassSchedule',
  title: 'Fast messeplan',
  type: 'document',
  icon: ClockIcon,
  fields: [
    sourceKeyField,
    defineField({
      name: 'title',
      title: 'Navn',
      description: 'Internt, tydelig navn, for eksempel «Norsk søndagsmesse i Kongsberg».',
      type: 'string',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'active',
      options: {
        layout: 'radio',
        list: [
          {title: 'Aktiv', value: 'active'},
          {title: 'Inaktiv', value: 'inactive'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'place',
      title: 'Sted',
      type: 'reference',
      to: [{type: 'place'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Språk',
      type: 'string',
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'anchorWeekday',
      title: 'Ankerdag',
      description:
        'Dagen gjentakelsen beregnes fra. Bruk forskyvning nedenfor hvis messen ligger før eller etter denne dagen.',
      type: 'string',
      options: {
        list: [
          {title: 'Mandag', value: 'monday'},
          {title: 'Tirsdag', value: 'tuesday'},
          {title: 'Onsdag', value: 'wednesday'},
          {title: 'Torsdag', value: 'thursday'},
          {title: 'Fredag', value: 'friday'},
          {title: 'Lørdag', value: 'saturday'},
          {title: 'Søndag', value: 'sunday'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'recurrenceType',
      title: 'Gjentakelse',
      type: 'string',
      initialValue: 'weekly',
      options: {
        layout: 'radio',
        list: [
          {title: 'Hver uke', value: 'weekly'},
          {title: 'Bestemte uker i måneden', value: 'monthlyWeeks'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'weeksOfMonth',
      title: 'Uker i måneden',
      description: 'For eksempel 2. og 4. søndag.',
      type: 'array',
      hidden: ({document}) => document?.recurrenceType !== 'monthlyWeeks',
      of: [
        defineArrayMember({
          type: 'number',
          options: {
            list: [
              {title: '1.', value: 1},
              {title: '2.', value: 2},
              {title: '3.', value: 3},
              {title: '4.', value: 4},
              {title: '5.', value: 5},
              {title: 'Siste', value: -1},
            ],
          },
        }),
      ],
      validation: (rule) =>
        rule.unique().custom((weeksOfMonth, context) => {
          if (context.document?.recurrenceType !== 'monthlyWeeks') return true
          return (weeksOfMonth?.length ?? 0) > 0 || 'Velg minst én uke i måneden.'
        }),
    }),
    defineField({
      name: 'dayOffset',
      title: 'Forskyvning i dager',
      description: 'Vanligvis 0. For «lørdagen før tredje søndag»: velg søndag, tredje uke og -1.',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(-6).max(6),
    }),
    defineField({
      name: 'startTime',
      title: 'Starttid',
      description: '24-timersformat, for eksempel 11:00.',
      type: 'string',
      validation: (rule) =>
        rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {name: 'klokkeslett (TT:MM)'}),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Forventet varighet i minutter',
      type: 'number',
      validation: (rule) => rule.integer().positive().max(600),
    }),
    defineField({
      name: 'validFrom',
      title: 'Gyldig fra',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'validUntil',
      title: 'Gyldig til',
      description: 'La stå tomt hvis planen gjelder inntil videre.',
      type: 'date',
      validation: (rule) =>
        rule.custom((validUntil, context) => {
          const validFrom = context.document?.validFrom
          if (typeof validUntil !== 'string' || typeof validFrom !== 'string') return true
          return validUntil >= validFrom || 'Sluttdato må være lik eller etter startdato.'
        }),
    }),
    defineField({
      name: 'notes',
      title: 'Merknad',
      description:
        'For eksempel informasjon om sesong eller ferie. Avvik på bestemte datoer lagres separat.',
      type: 'text',
      rows: 3,
    }),
  ],
  orderings: [
    {
      title: 'Navn',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      place: 'place.name',
      language: 'language',
      anchorWeekday: 'anchorWeekday',
      dayOffset: 'dayOffset',
      startTime: 'startTime',
      status: 'status',
    },
    prepare({title, place, language, anchorWeekday, dayOffset, startTime, status}) {
      const offsetLabel = dayOffset ? `${dayOffset > 0 ? '+' : ''}${dayOffset} dag` : undefined
      const dayAndTime = [
        weekdayLabels[anchorWeekday],
        offsetLabel,
        startTime ? `kl. ${startTime}` : undefined,
      ]
        .filter(Boolean)
        .join(' ')
      const schedule = [dayAndTime, languageLabels[language]].filter(Boolean).join(' · ')

      return {
        title: status === 'inactive' ? `Inaktiv: ${title}` : title,
        subtitle: [place, schedule].filter(Boolean).join(' · '),
      }
    },
  },
})
