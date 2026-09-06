import {BlockContentIcon} from '@sanity/icons/BlockContent'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const richText = defineType({
  name: 'richText',
  title: 'Rik tekst',
  type: 'array',
  icon: BlockContentIcon,
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Overskrift 2', value: 'h2'},
        {title: 'Overskrift 3', value: 'h3'},
        {title: 'Sitat', value: 'blockquote'},
      ],
      lists: [
        {title: 'Punktliste', value: 'bullet'},
        {title: 'Nummerert liste', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Fet', value: 'strong'},
          {title: 'Kursiv', value: 'em'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Lenke',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'Nettadresse',
                type: 'url',
                validation: (rule) =>
                  rule.required().uri({scheme: ['http', 'https', 'mailto', 'tel']}),
              }),
            ],
          }),
        ],
      },
    }),
  ],
})
