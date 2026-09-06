import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'
import {sourceKeyField} from '../shared/sourceKeyField'

export const massText = defineType({
  name: 'massText',
  title: 'Messetekst',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    sourceKeyField,
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: 'massDate',
      title: 'Dato for messen',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'massSchedule',
      title: 'Messe',
      description: 'Skal normalt være norsk messe kl. 11 i Kongsberg.',
      type: 'reference',
      to: [{type: 'recurringMassSchedule'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Tekst',
      type: 'richText',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceBulletin',
      title: 'Kildesøndagsblad',
      type: 'reference',
      to: [{type: 'bulletin'}],
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Nyeste først',
      name: 'massDateDesc',
      by: [{field: 'massDate', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      massDate: 'massDate',
      schedule: 'massSchedule.title',
    },
    prepare({title, massDate, schedule}) {
      return {
        title,
        subtitle: [massDate, schedule].filter(Boolean).join(' · '),
      }
    },
  },
})
