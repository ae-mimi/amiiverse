import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schema'

export default defineConfig({
    name: 'default',
    title: 'Amiiverse CMS',

    projectId: 'pxn399gi',
    dataset: 'production',

    plugins: [structureTool()],

    schema: {
        types: schemaTypes,
    },
})
