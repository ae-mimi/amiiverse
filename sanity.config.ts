import { defineConfig, defineLocaleResourceBundle } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schema'
import { deskStructure } from './schema/deskStructure'

/**
 * English translations for Sanity Studio UI keys that aren't
 * resolving automatically in sanity@3.99+.
 */
const enUS_release = defineLocaleResourceBundle({
    locale: 'en-US',
    namespace: 'release',
    resources: {
        'chip.published': 'Published',
        'chip.draft': 'Draft',
    },
})

const enUS_structure = defineLocaleResourceBundle({
    locale: 'en-US',
    namespace: 'structure',
    resources: {
        'panes.document-list-pane.search-input.placeholder': 'Search',
    },
})

const enUS_inputs = defineLocaleResourceBundle({
    locale: 'en-US',
    namespace: 'inputs',
    resources: {
        'array.action.add-item-select-type': 'Add block…',
    },
})

const sanityProjectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'pxn399gi'
const sanityDataset = process.env.PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
    name: 'default',
    title: 'Amiiverse CMS',

    projectId: sanityProjectId,
    dataset: sanityDataset,

    plugins: [
        structureTool({
            structure: deskStructure,
        }),
    ],

    schema: {
        types: schemaTypes,
    },

    i18n: {
        bundles: [enUS_release, enUS_structure, enUS_inputs],
    },
})
