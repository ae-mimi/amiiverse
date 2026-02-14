import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://amiiverse.com', // Replace with actual domain
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    icon(),
    sitemap(),
    sanity({
      projectId: 'pxn399gi',
      dataset: 'production',
      useCdn: false, // set to true for production if you want caching
      studioBasePath: '/admin',
    }),
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop'
    }
  }
});