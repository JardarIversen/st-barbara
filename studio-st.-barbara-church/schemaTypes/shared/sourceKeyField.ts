import {defineField} from 'sanity'

export const sourceKeyField = defineField({
  name: 'sourceKey',
  title: 'Importnøkkel',
  description: 'Stabil nøkkel brukt av importagenten for idempotente oppdateringer.',
  type: 'string',
  hidden: true,
  readOnly: true,
})
