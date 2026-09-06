import {defineField, defineType} from 'sanity'

export const translatedCopy = defineType({
  name: 'translatedCopy',
  title: 'Oversatt tekst',
  type: 'object',
  fields: [
    ...['title', 'titleOverride', 'name', 'category', 'mainImageAlt'].map((name) =>
      defineField({name, type: 'string'}),
    ),
    ...['summary', 'notes', 'publicNote'].map((name) => defineField({name, type: 'text', rows: 3})),
    defineField({name: 'body', title: 'Tekst', type: 'richText'}),
    defineField({name: 'details', title: 'Detaljer', type: 'richText'}),
    defineField({
      name: 'links',
      title: 'Lenker med oversatt etikett',
      type: 'array',
      of: [{type: 'actionLink'}],
    }),
    defineField({
      name: 'sourceHashes',
      title: 'Kildekontroll',
      type: 'object',
      hidden: true,
      fields: [
        'title',
        'titleOverride',
        'name',
        'category',
        'mainImageAlt',
        'summary',
        'notes',
        'publicNote',
        'body',
        'details',
        'links',
      ].map((name) => defineField({name, type: 'string'})),
    }),
  ],
})

export const translationsField = defineField({
  name: 'translations',
  title: 'Oversettelser',
  type: 'internationalizedArrayTranslatedCopy',
  description:
    'Norsk original står i feltene over. Oversett bare tekst; datoer, sted, messespråk og status er felles. Oppdater oversettelsen når originalen endres.',
})
