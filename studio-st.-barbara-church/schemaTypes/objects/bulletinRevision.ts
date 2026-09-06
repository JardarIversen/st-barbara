import {DocumentPdfIcon} from '@sanity/icons/DocumentPdf'
import {defineField, defineType} from 'sanity'

export const bulletinRevision = defineType({
  name: 'bulletinRevision',
  title: 'Tidligere PDF-versjon',
  type: 'object',
  icon: DocumentPdfIcon,
  fields: [
    defineField({
      name: 'pdf',
      title: 'PDF',
      type: 'file',
      options: {accept: 'application/pdf'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceHash',
      title: 'SHA-256',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'supersededAt',
      title: 'Erstattet',
      type: 'datetime',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'note',
      title: 'Merknad',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'pdf.asset.originalFilename',
      subtitle: 'supersededAt',
    },
  },
})
