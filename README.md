# amiiverse

Astro site configured for Cloudflare Pages + Workers runtime.

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run deploy`

## Repo Docs

- project structure map: [docs/project-structure.md](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/docs/project-structure.md)
- docs index: [docs/README.md](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/docs/README.md)
- Brevo setup guide: [docs/setup/brevo-setup-guide.md](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/docs/setup/brevo-setup-guide.md)

## API / Functions Structure

- This project uses Astro API routes in `src/pages/api`.
- On Cloudflare Pages with the Astro Cloudflare adapter, these routes are compiled into Pages Functions automatically.
- Do not create a separate `/functions` directory unless you intentionally bypass Astro routing.

## Cloudflare Deploy Requirements

### Build/runtime

- Astro config must keep `output: "server"` and `adapter: cloudflare()`.
- Deploy the generated `dist` output using Cloudflare Pages.

### Environment variables and secrets

Set these in Cloudflare Pages project settings (`Settings -> Environment variables`) for each environment.

Server-only secrets:

- `ADMIN_SYNC_TOKEN`
- `SANITY_WRITE_TOKEN`
- `BREVO_API_KEY`
- `BREVO_NEWSLETTER_LIST_ID` or `BREVO_LIST_ID`
- `BREVO_CONTACT_LIST_ID`
- `BREVO_DOUBLE_OPT_IN_TEMPLATE_ID`
- `BREVO_DOUBLE_OPT_IN_REDIRECT`
- `TURNSTILE_SECRET_KEY`
- `TYPESENSE_ADMIN_API_KEY`

Public variables:

- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `PUBLIC_TURNSTILE_SITE_KEY`
- `PUBLIC_TYPESENSE_HOST`
- `PUBLIC_TYPESENSE_SEARCH_API_KEY`
- `PUBLIC_TYPESENSE_COLLECTION`

### Cloudflare bindings

Configure bindings in Cloudflare and access them only on server runtime.

- D1: `DB`
- Turnstile secret: `TURNSTILE_SECRET_KEY`

### Server runtime env access rule

- API routes should read sensitive values from Cloudflare runtime env (`context.locals.runtime.env`) with safe fallback for local development.
- Client-side code must only read `PUBLIC_*` variables.
- For preview/production separation, set environment variables separately in Cloudflare Pages for each environment.

## Local environment

Copy `.env.example` to `.env` and fill placeholders for local development.

## Cloudflare D1 Migrations

### Files

- Base schema: `db/schema.sql`

### Run migrations with Wrangler

Replace `<YOUR_D1_DB_NAME>` with the D1 binding/database name configured in Cloudflare.

- Apply migration to local D1:
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --local --file=./db/migrations/0003_music_search.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --local --file=./db/migrations/0004_fan_leads.sql`
- Apply migration to remote D1:
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --remote --file=./db/migrations/0003_music_search.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --remote --file=./db/migrations/0004_fan_leads.sql`
