import {BellIcon} from '@sanity/icons/Bell'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {sourceKeyField} from '../shared/sourceKeyField'

const priorityLabels: Record<string, string> = {
  normal: 'Normal',
  important: 'Viktig',
  urgent: 'Haster',
}

export const announcement = defineType({
  name: 'announcement',
  title: 'Kunngjøring',
  type: 'document',
  icon: BellIcon,
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
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'active',
      options: {
        layout: 'radio',
        list: [
          {title: 'Aktiv', value: 'active'},
          {title: 'Avsluttet', value: 'resolved'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Prioritet',
      description: 'Kan vurderes av agenten ved innlesing.',
      type: 'string',
      initialValue: 'normal',
      options: {
        layout: 'radio',
        list: [
          {title: 'Normal', value: 'normal'},
          {title: 'Viktig', value: 'important'},
          {title: 'Haster', value: 'urgent'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Først publisert',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lastMentionedAt',
      title: 'Sist omtalt',
      description: 'Oppdateres når kunngjøringen gjentas i et nytt søndagsblad.',
      type: 'datetime',
    }),
    defineField({
      name: 'appliesFrom',
      title: 'Gjelder fra',
      type: 'datetime',
    }),
    defineField({
      name: 'appliesUntil',
      title: 'Gjelder til',
      type: 'datetime',
      validation: (rule) =>
        rule.custom((appliesUntil, context) => {
          const appliesFrom = context.document?.appliesFrom
          if (typeof appliesUntil !== 'string' || typeof appliesFrom !== 'string') return true
          return new Date(appliesUntil) >= new Date(appliesFrom) || 'Slutt må være etter start.'
        }),
    }),
    defineField({
      name: 'summary',
      title: 'Kort beskrivelse',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(280).warning('Hold kortteksten under 280 tegn.'),
    }),
    defineField({
      name: 'body',
      title: 'Detaljer',
      type: 'richText',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'places',
      title: 'Aktuelle steder',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'place'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'relatedEvents',
      title: 'Relaterte hendelser',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'event'}]})],
      validation: (rule) => rule.unique(),
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
      description: 'Gjentatte kunngjøringer gjenbrukes og kobles til flere blader.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'bulletin'}]})],
      validation: (rule) => rule.unique(),
    }),
  ],
  orderings: [
    {
      title: 'Nyeste først',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
    {
      title: 'Gjelder fra',
      name: 'appliesFromAsc',
      by: [{field: 'appliesFrom', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      priority: 'priority',
      publishedAt: 'publishedAt',
    },
    prepare({title, status, priority, publishedAt}) {
      const date = publishedAt
        ? new Intl.DateTimeFormat('nb-NO', {
            dateStyle: 'medium',
            timeZone: 'Europe/Oslo',
          }).format(new Date(publishedAt))
        : undefined
      const state = status === 'resolved' ? 'Avsluttet' : (priorityLabels[priority] ?? 'Normal')

      return {
        title,
        subtitle: [state, date].filter(Boolean).join(' · '),
      }
    },
  },
})
