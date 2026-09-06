import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'

export default defineConfig({
  name: 'default',
  title: 'St. Barbara Church',

  projectId: '2jd536j2',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool(), internationalizedArray({
    languages: [{id: 'en', title: 'English'}],
    fieldTypes: ['translatedCopy'],
    restoreOrder: false,
    languageDisplay: 'titleOnly',
  })],

  schema: {
    types: schemaTypes,
  },
})
