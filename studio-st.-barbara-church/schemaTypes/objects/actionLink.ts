import {LinkIcon} from '@sanity/icons/Link'
import {defineField, defineType} from 'sanity'

export const actionLink = defineType({
  name: 'actionLink',
  title: 'Lenke',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Lenketekst',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'url',
      title: 'Nettadresse',
      type: 'url',
      validation: (rule) =>
        rule.required().uri({
          scheme: ['http', 'https', 'mailto', 'tel'],
        }),
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'url',
    },
  },
})
