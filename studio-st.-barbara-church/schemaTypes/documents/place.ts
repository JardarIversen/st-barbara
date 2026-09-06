import {PinIcon} from '@sanity/icons/Pin'
import {defineField, defineType} from 'sanity'
import {sourceKeyField} from '../shared/sourceKeyField'

const placeTypeLabels: Record<string, string> = {
  church: 'Kirke',
  chapel: 'Kapell',
  venue: 'Besøkssted',
  meetingPoint: 'Møtested',
  other: 'Annet sted',
}

export const place = defineType({
  name: 'place',
  title: 'Sted',
  type: 'document',
  icon: PinIcon,
  fields: [
    sourceKeyField,
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Nettadresse-ID',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'placeType',
      title: 'Type sted',
      type: 'string',
      initialValue: 'venue',
      options: {
        layout: 'radio',
        list: [
          {title: 'Kirke', value: 'church'},
          {title: 'Kapell', value: 'chapel'},
          {title: 'Besøkssted', value: 'venue'},
          {title: 'Møtested', value: 'meetingPoint'},
          {title: 'Annet', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'streetAddress',
      title: 'Gateadresse',
      type: 'string',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'postalCode',
      title: 'Postnummer',
      type: 'string',
      validation: (rule) => rule.regex(/^\d{4}$/, {name: 'norsk postnummer'}).warning(),
    }),
    defineField({
      name: 'locality',
      title: 'Poststed',
      type: 'string',
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: 'country',
      title: 'Land',
      type: 'string',
      initialValue: 'Norge',
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: 'mapUrl',
      title: 'Kartlenke',
      description: 'En delbar lenke til stedet i Google Maps eller en annen karttjeneste.',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'coordinates',
      title: 'Koordinater',
      description: 'Valgfritt. Kan brukes til kartvisning senere.',
      type: 'geopoint',
    }),
    defineField({
      name: 'details',
      title: 'Praktisk informasjon',
      type: 'richText',
    }),
  ],
  orderings: [
    {
      title: 'Navn',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      placeType: 'placeType',
      streetAddress: 'streetAddress',
      locality: 'locality',
    },
    prepare({title, placeType, streetAddress, locality}) {
      const address = [streetAddress, locality].filter(Boolean).join(', ')
      const typeLabel = placeTypeLabels[placeType] ?? 'Sted'

      return {
        title,
        subtitle: address ? `${typeLabel} · ${address}` : typeLabel,
      }
    },
  },
})
