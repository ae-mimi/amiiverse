import { defineCliConfig } from 'sanity/cli'

const sanityProjectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'pxn399gi'
const sanityDataset = process.env.PUBLIC_SANITY_DATASET || 'production'

export default defineCliConfig({
    api: {
        projectId: sanityProjectId,
        dataset: sanityDataset,
    },
    deployment: {
        appId: 'aviiysjatn84yq1fp6j7lv8w',
        autoUpdates: true,
    },
})
