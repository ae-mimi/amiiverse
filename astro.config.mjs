import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import icon from 'astro-icon';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    icon(),
    react(),
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