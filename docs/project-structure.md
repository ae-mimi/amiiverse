# Project Structure

This is the current intended mental model for the repo.

It reflects the live tree today, not an idealized future tree.

## Top Level

- `src/`: Astro app source
- `schema/`: Sanity schema definitions and desk structure
- `db/`: D1 schema and migrations
- `public/`: static assets and headers/redirect files
- `docs/`: project documentation and repo navigation notes

## `src/`

### `src/pages`
- Route entrypoints
- Includes Astro pages and API routes
- `src/pages/api` is the server/API boundary for Cloudflare Pages Functions behavior

### `src/layouts`
- Shared page shells
- Example: [`BaseLayout.astro`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/src/layouts/BaseLayout.astro)

### `src/components`
- Presentation and page-building layer

#### `src/components/blocks`
- Thin CMS adapters
- Each block should stay focused on mapping Sanity section props to feature components
- Good place for page-builder level composition, not large client logic

#### `src/components/forms`
- Shared form system pieces

Current layout:
- `base/`: field, consent, status, submit primitives
- `contact/`: business contact form composition
- `newsletter/`: newsletter form composition

#### `src/components/navigation`
- Header-level navigation pieces
- Brand, socials, shared site navigation, mobile menu overlay

#### `src/components/ui`
- Reusable non-block UI pieces that are still shared across multiple blocks
- Keep this folder for genuinely shared UI, not page-specific feature logic

#### `src/components/seo`
- Head/meta helpers

### `src/lib`
- Logic and data helpers

#### `src/lib/client`
- Browser-only interaction controllers
- Examples:
  - newsletter/contact form submission
  - header/mobile nav behavior

#### `src/lib/server`
- Server-side runtime env, Brevo integration, and backend helpers

#### `src/lib/sanity`
- Sanity client, GROQ queries, types, and write helpers

#### `src/lib/utils`
- Cross-feature helpers used by multiple blocks/components

#### `src/lib/seo`
- SEO-specific data builders

#### `src/lib/siteSettings.ts`
- Global settings normalization and fetch/merge logic for layout, SEO, and manifest consumers

### `src/styles`
- Global stylesheet layers

## `schema/`

- `schema/index.ts`: schema registration root
- `schema/page.ts`: page builder section schema
- `schema/settings.ts`: global site settings
- `schema/documents/`: Sanity document types
- `schema/objects/`: reusable object schema pieces

## Navigation Tips

When making changes:
- CMS block rendering issue: start in `schema/page.ts`, then `src/components/PageBuilder.astro`, then the matching block
- form issue: start in `src/components/forms`, then `src/lib/client/forms.ts`, then the API route
- global header/footer/settings issue: start in `src/components/layout`, `src/components/navigation`, and `src/lib/siteSettings.ts`

## Cleanup Rules

To keep the tree intuitive:
- prefer block adapters in `blocks/`, feature logic in domain folders
- prefer browser behavior in `src/lib/client` instead of large inline scripts
- prefer shared form parts in `src/components/forms/base`
