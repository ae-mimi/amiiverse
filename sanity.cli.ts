import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
    api: {
        projectId: 'pxn399gi',
        dataset: 'production'
  },
  deployment: {
    appId: 'ajbupod10cgtjvy4ob9736eg',
    autoUpdates: true
  }
})
