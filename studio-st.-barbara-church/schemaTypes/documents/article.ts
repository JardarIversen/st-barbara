import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {sourceKeyField} from '../shared/sourceKeyField'

const articleTypeLabels: Record<string, string> = {
  pastoralLetter: 'Hyrdebrev',
  letter: 'Brev',
  news: 'Nyhet',
  reference: 'Bakgrunnsstoff',
  other: 'Artikkel',
}

export const article = defineType({
  name: 'article',
  title: 'Artikkel',
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
      name: 'slug',
      title: 'Nettadresse-ID',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'articleType',
      title: 'Type artikkel',
      type: 'string',
      initialValue: 'other',
      options: {
        layout: 'radio',
        list: [
          {title: 'Hyrdebrev', value: 'pastoralLetter'},
          {title: 'Brev', value: 'letter'},
          {title: 'Nyhet', value: 'news'},
          {title: 'Bakgrunnsstoff', value: 'reference'},
          {title: 'Annet', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publisert',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      description: 'Kort, offentlig kategori, for eksempel «Katekese» eller «Livets gang».',
      type: 'string',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'mainImage',
      title: 'Hovedbilde',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativ tekst',
          type: 'string',
          validation: (rule) => rule.required().warning('Beskriv bildet for skjermlesere.'),
        }),
      ],
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
      title: 'Innhold',
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
  ],
  preview: {
    select: {
      title: 'title',
      articleType: 'articleType',
      publishedAt: 'publishedAt',
      media: 'mainImage',
    },
    prepare({title, articleType, publishedAt, media}) {
      const date = publishedAt
        ? new Intl.DateTimeFormat('nb-NO', {
            dateStyle: 'medium',
            timeZone: 'Europe/Oslo',
          }).format(new Date(publishedAt))
        : undefined

      return {
        title,
        subtitle: [articleTypeLabels[articleType] ?? 'Artikkel', date].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
