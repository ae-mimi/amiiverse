import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
    api: {
        projectId: 'pxn399gi',
        dataset: 'production'
    },
    deployment: {
    appId: 'cc38d9933uk2lc021vvm1upp',
    autoUpdates: true
  }
})
