import {CalendarIcon} from '@sanity/icons/Calendar'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {translationsField} from './translatedCopy'

const contactField = defineField({
  name: 'contact', title: 'Kontaktperson', type: 'object',
  fields: [
    defineField({name: 'name', title: 'Navn', type: 'string', validation: r => r.required()}),
    defineField({name: 'email', title: 'Offentlig e-post', type: 'string', validation: r => r.required().email()}),
  ],
})
const copyFields = [
  defineField({name: 'title', title: 'Overskrift', type: 'string', validation: r => r.required()}),
  defineField({name: 'summary', title: 'Kort informasjon', type: 'text', rows: 2}),
  defineField({name: 'body', title: 'Praktisk informasjon', type: 'richText'}),
  translationsField,
]
const timeField = (name: string, title: string, required = false) => defineField({
  name, title, type: 'string',
  description: 'Lokal tid i Norge, TT:MM.',
  validation: r => required ? r.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/) : r.regex(/^([01]\d|2[0-3]):[0-5]\d$/),
})

export const catechesisSession = defineType({
  name: 'catechesisSession', title: 'Undervisningstid / gruppe', type: 'object', icon: CalendarIcon,
  fields: [
    ...copyFields,
    timeField('startTime', 'Fra', true),
    timeField('endTime', 'Til', true),
    timeField('massTime', 'Messe'),
    defineField({name: 'communionYear', title: 'Planlagt kommunionsår', type: 'number', validation: r => r.integer().min(2000).max(2100)}),
    defineField({name: 'communionDate', title: 'Planlagt kommunionsdato', type: 'date'}),
  ],
})

export const catechesisGroup = defineType({
  name: 'catechesisGroup', title: 'Aldersgruppe', type: 'object', icon: CalendarIcon,
  fields: [
    ...copyFields,
    defineField({name: 'sessions', title: 'Undervisningstider', type: 'array', of: [defineArrayMember({type: 'catechesisSession'})], validation: r => r.required().min(1)}),
    defineField({name: 'sessionDates', title: 'Bekreftede samlingsdatoer', type: 'array', description: 'Felles for undervisningsgruppene over. Ikke fyll inn beregnede datoer for fleksibelt oppmøte.', of: [defineArrayMember({type: 'date'})], validation: r => r.unique()}),
    contactField,
  ],
})

export const catechesisOffering = defineType({
  name: 'catechesisOffering', title: 'Annet tilbud', type: 'object', icon: CalendarIcon,
  fields: [...copyFields, contactField],
})

export const catechesisProgram = defineType({
  name: 'catechesisProgram', title: 'Katekese: grupper og samlinger', type: 'object', icon: CalendarIcon,
  fields: [
    defineField({name: 'summary', title: 'Beskjed om påmelding', type: 'text', rows: 3}),
    defineField({name: 'groups', title: 'Aldersgrupper', type: 'array', of: [defineArrayMember({type: 'catechesisGroup'})], validation: r => r.required().min(1)}),
    defineField({name: 'otherOfferings', title: 'Andre steder og tilbud', type: 'array', of: [defineArrayMember({type: 'catechesisOffering'})]}),
    translationsField,
  ],
})
