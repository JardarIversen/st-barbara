import {DocumentPdfIcon} from '@sanity/icons/DocumentPdf'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {sourceKeyField} from '../shared/sourceKeyField'

function formatDate(value?: string) {
  if (!value) return 'Udatert søndagsblad'
  return new Intl.DateTimeFormat('nb-NO', {dateStyle: 'long', timeZone: 'Europe/Oslo'}).format(
    new Date(`${value}T12:00:00+02:00`),
  )
}

export const bulletin = defineType({
  name: 'bulletin',
  title: 'Søndagsblad',
  type: 'document',
  icon: DocumentPdfIcon,
  fields: [
    sourceKeyField,
    defineField({
      name: 'issueDate',
      title: 'Dato',
      description: 'Datoen søndagsbladet gjelder fra.',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publisert',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coversFrom',
      title: 'Dekker fra',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coversUntil',
      title: 'Dekker til',
      type: 'date',
      validation: (rule) =>
        rule.required().custom((coversUntil, context) => {
          const coversFrom = context.document?.coversFrom
          if (typeof coversUntil !== 'string' || typeof coversFrom !== 'string') return true
          return coversUntil >= coversFrom || 'Sluttdato må være lik eller etter startdato.'
        }),
    }),
    defineField({
      name: 'pdf',
      title: 'Original PDF',
      description: 'Originalfilen beholdes som kilde og nedlasting.',
      type: 'file',
      options: {accept: 'application/pdf'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceHash',
      title: 'SHA-256',
      description: 'Brukes av importagenten til å oppdage identiske og korrigerte filer.',
      type: 'string',
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'revision',
      title: 'Revisjon',
      type: 'number',
      initialValue: 1,
      readOnly: true,
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: 'previousRevisions',
      title: 'Tidligere PDF-versjoner',
      description: 'Bevarer eldre filer når et korrigert søndagsblad mottas.',
      type: 'array',
      readOnly: true,
      of: [defineArrayMember({type: 'bulletinRevision'})],
    }),
    defineField({
      name: 'internalNotes',
      title: 'Interne notater',
      description: 'Vises ikke på nettsiden.',
      type: 'text',
      rows: 3,
    }),
  ],
  orderings: [
    {
      title: 'Nyeste først',
      name: 'issueDateDesc',
      by: [{field: 'issueDate', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      issueDate: 'issueDate',
      filename: 'pdf.asset.originalFilename',
    },
    prepare({issueDate, filename}) {
      return {
        title: `Søndagsblad – ${formatDate(issueDate)}`,
        subtitle: filename,
      }
    },
  },
})
