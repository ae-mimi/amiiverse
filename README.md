# amiiverse

Astro site configured for Cloudflare Pages + Workers runtime.

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run deploy`

## Repo Docs

- compatibility inventory: [docs/compatibility-inventory.md](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/docs/compatibility-inventory.md)
- project structure map: [docs/project-structure.md](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/docs/project-structure.md)
- docs index: [docs/README.md](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/docs/README.md)
- launch workflow: [docs/launch/launch-step-by-step-guide.md](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/docs/launch/launch-step-by-step-guide.md)
- launch checklist: [docs/launch/launch-checklist.md](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/docs/launch/launch-checklist.md)
- cloudflare setup checklist: [docs/setup/phase1-cloudflare-setup.txt](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/docs/setup/phase1-cloudflare-setup.txt)
- brevo setup guide: [docs/setup/brevo-setup-guide.md](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/docs/setup/brevo-setup-guide.md)

## API / Functions Structure

- This project uses Astro API routes in `src/pages/api`.
- On Cloudflare Pages with the Astro Cloudflare adapter, these routes are compiled into Pages Functions automatically.
- Do not create a separate `/functions` directory unless you intentionally bypass Astro routing.

## Cloudflare Deploy Requirements

### 1. Build/runtime

- Astro config must keep `output: "server"` and `adapter: cloudflare()`.
- Deploy the generated `dist` output using Cloudflare Pages.

### 2. Environment variables and secrets

Set these in Cloudflare Pages project settings (`Settings -> Environment variables`) for each environment (Preview/Production).

Server-only secrets:

- `ADMIN_SYNC_TOKEN`
- `FLUTTERWAVE_SECRET_KEY`
- `FLUTTERWAVE_WEBHOOK_HASH` (required for `POST /api/flutterwave/webhook`)
- `SANITY_WRITE_TOKEN`
- `BREVO_API_KEY`
- `BREVO_NEWSLETTER_LIST_ID` (preferred, falls back to `BREVO_LIST_ID`)
- `BREVO_CONTACT_LIST_ID` (optional but recommended)
- `BREVO_LIST_ID` (legacy fallback)
- `BREVO_DOUBLE_OPT_IN_TEMPLATE_ID`
- `BREVO_DOUBLE_OPT_IN_REDIRECT`
- `TYPESENSE_ADMIN_API_KEY`

Public (safe to expose to client, must use `PUBLIC_` prefix):

- `PUBLIC_TYPESENSE_HOST`
- `PUBLIC_TYPESENSE_SEARCH_API_KEY`
- `PUBLIC_TYPESENSE_COLLECTION`
- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`

### 3. Cloudflare bindings (no raw credentials in code)

Configure bindings in Cloudflare (or `wrangler.toml`) and access them only on server runtime.

- D1: `DB`
- KV: `CACHE`
- R2: `ASSETS_BUCKET`
- Turnstile secret: `TURNSTILE_SECRET_KEY`

### 5. Secure digital downloads (R2)

- Endpoint: `GET /api/download?reference=<order_reference>&productId=<product_id>`
- Access rules:
  - Order must exist and be `paid`
  - Product must be part of that order's cart
  - Product must be `digital`
  - Product must have `r2_key` in `products_cache`
- Delivery:
  - File is streamed from R2 by the Worker (no direct R2 URL exposed to frontend)
  - Basic rate limiting is enforced via KV (`CACHE`) by order reference

### 4. Server runtime env access rule

- API routes should read sensitive values from Cloudflare runtime env (`context.locals.runtime.env`) with safe fallback for local development.
- Client-side code must only read `PUBLIC_*` variables.

## Local environment

Copy `.env.example` to `.env` and fill placeholders for local development.

## Cloudflare D1 Migrations

### Files

- Base schema: `db/schema.sql`
- First migration: `db/migrations/0001_shop.sql`

### Run migrations with Wrangler

Replace `<YOUR_D1_DB_NAME>` with the D1 binding/database name configured in Cloudflare.

- Apply migration to local D1:
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --local --file=./db/migrations/0001_shop.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --local --file=./db/migrations/0002_add_r2_key.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --local --file=./db/migrations/0003_music_search.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --local --file=./db/migrations/0004_fan_leads.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --local --file=./db/migrations/0005_payment_provider.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --local --file=./db/migrations/0006_phase2_ecommerce.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --local --file=./db/migrations/0007_normalize_orders_schema.sql`
- Apply migration to remote D1:
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --remote --file=./db/migrations/0001_shop.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --remote --file=./db/migrations/0002_add_r2_key.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --remote --file=./db/migrations/0003_music_search.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --remote --file=./db/migrations/0004_fan_leads.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --remote --file=./db/migrations/0005_payment_provider.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --remote --file=./db/migrations/0006_phase2_ecommerce.sql`
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --remote --file=./db/migrations/0007_normalize_orders_schema.sql`

### Optional verification

- List tables:
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"`
- Check FTS rows:
  - `npx wrangler d1 execute <YOUR_D1_DB_NAME> --remote --command "SELECT count(*) AS products_fts_count FROM products_fts;"`

## Product Cache Sync (Sanity -> D1)

### Endpoint

- `POST /api/admin/sync-products`
- Required header: `X-ADMIN-TOKEN: <ADMIN_SYNC_TOKEN>`

Behavior:

- Fetches products from Sanity (`product` documents)
- Upserts into D1 table `products_cache`
- Rebuilds `products_fts` from `products_cache` for title/description search

### Trigger manually

Local dev:

- `curl -X POST http://127.0.0.1:4321/api/admin/sync-products -H "X-ADMIN-TOKEN: <ADMIN_SYNC_TOKEN>"`
- or `npm run sync:products:local`

Production:

- `curl -X POST https://<your-domain>/api/admin/sync-products -H "X-ADMIN-TOKEN: <ADMIN_SYNC_TOKEN>"`

### Recommended workflow after product changes

1. Publish product edits in Sanity Studio.
2. Trigger `POST /api/admin/sync-products` (manually, CI job, or webhook relay).
3. Validate cache/FTS state:
   - `SELECT count(*) FROM products_cache;`
   - `SELECT rowid, title, slug FROM products_fts WHERE products_fts MATCH 'your term';`
