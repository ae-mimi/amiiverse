import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://weareamii.com',
  output: 'server',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [
    icon(),
    react(),
    sitemap(),
    sanity({
      projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'pxn399gi',
      dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
      useCdn: false, // set to true for production if you want caching
      studioBasePath: '/admin',
      studioRouterHistory: 'hash',
    }),
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop'
    }
  },
  vite: {
    build: {
      // Sanity Studio ships a large admin bundle by design.
      chunkSizeWarningLimit: 6000
    }
  }
});
