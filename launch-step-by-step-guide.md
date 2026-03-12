# Launch Guide (Beginner-Friendly)

This guide is written for non-technical users. Follow it top to bottom.

If something does not match your screen, stop and take a screenshot before continuing.

## What You Are Setting Up

By the end of this guide, you will have:
1. Your site running on `weareamii.com`
2. Payments handled by Flutterwave
3. Webhooks connected so paid orders update automatically
4. Sanity content and legal footer text live
5. Final safety checks completed

---

## Step 0: Keep These Tabs Open

Open these 3 files in your editor while you work:
1. `launch-checklist.md`
2. `launch-step-by-step-guide.md` (this file)
3. `phase1-cloudflare-setup.txt`

Open these dashboards in browser tabs:
1. Cloudflare dashboard
2. Flutterwave dashboard
3. Sanity dashboard/studio

---

## Step 1: Collect Important Values First (ENV Values)

Do this first so later steps are faster.

### 1A) Flutterwave values
Go to Flutterwave Dashboard:
1. Open `Settings` -> `API keys`
2. Copy your Test Secret Key
   - This becomes: `FLUTTERWAVE_SECRET_KEY_TEST`
3. Copy your Live Secret Key
   - This becomes: `FLUTTERWAVE_SECRET_KEY_LIVE`

Now get webhook hash:
1. Open `Settings` -> `Webhooks`
2. In `Secret hash`, paste your own random string (or keep existing if already set)
3. Copy that exact value
   - Use separate values for each environment:
   - `FLUTTERWAVE_WEBHOOK_SECRET_TEST`
   - `FLUTTERWAVE_WEBHOOK_SECRET_LIVE`


### 1B) Sanity values
You need these 3:
1. `PUBLIC_SANITY_PROJECT_ID`
2. `PUBLIC_SANITY_DATASET`
3. `SANITY_WRITE_TOKEN`

How to get `PUBLIC_SANITY_PROJECT_ID`:
1. Open Sanity project dashboard.
2. Go to project settings / project info.
3. Copy the Project ID.
4. Paste into Cloudflare env var `PUBLIC_SANITY_PROJECT_ID`.

How to get `PUBLIC_SANITY_DATASET`:
1. In Sanity dashboard, open `Datasets`.
2. Find the dataset you actively publish to.
3. Usually this is `production`.
4. Copy that exact dataset name.
5. Paste into Cloudflare env var `PUBLIC_SANITY_DATASET`.

How to get `SANITY_WRITE_TOKEN`:
1. Open Sanity Manage -> `API` -> `Tokens`.
2. Click `Add API token`.
3. Name it (for example: `Cloudflare Write Token`).
4. Give it write permissions required by your sync flow.
5. Copy and store securely.
6. Paste into Cloudflare env var `SANITY_WRITE_TOKEN`.

Quick fallback (if dashboard is confusing):
- Open `sanity.config.ts` in this repo.
- Use existing values there as starter values.

### 1C) Turnstile values (Cloudflare)
Go to Cloudflare -> Turnstile widget:
1. Copy `Site key`
   - `PUBLIC_TURNSTILE_SITE_KEY`
2. Copy `Secret key`
   - `TURNSTILE_SECRET_KEY`

### 1D) Internal token
Create admin token:
```bash
node -e "const c=require('crypto');console.log(c.randomBytes(32).toString('hex'))"
```
Use output as:
- `ADMIN_SYNC_TOKEN`

### 1E) Site URL
Use exactly:
- `PUBLIC_SITE_URL=https://weareamii.com`

### 1F) Brevo values (only if newsletter/contact sync is enabled)
These are used by subscribe/contact sync endpoints.

- `BREVO_API_KEY`
  - Brevo Dashboard -> `SMTP & API` -> `API keys` -> create/copy key.
  - Use as `Secret`.

- `BREVO_NEWSLETTER_LIST_ID` (preferred) or `BREVO_LIST_ID` (legacy fallback)
  - Brevo Dashboard -> `Contacts` -> `Lists` -> open your newsletter list -> copy numeric ID.
  - Use as `Text`.

- `BREVO_CONTACT_LIST_ID` (optional but recommended)
  - Brevo Dashboard -> `Contacts` -> `Lists` -> open your contact/inbox list -> copy numeric ID.
  - Use as `Text`.

- `BREVO_DOUBLE_OPT_IN_TEMPLATE_ID`
  - Brevo Dashboard -> `Campaigns`/`Templates` -> open template -> copy ID.
  - Use as `Text`.

- `BREVO_DOUBLE_OPT_IN_REDIRECT`
  - Your redirect URL after confirmation, for example:
    - `https://weareamii.com/newsletter-success`
  - Use as `Text`.

### 1G) Typesense values (only if product search is using Typesense)
- `PUBLIC_TYPESENSE_HOST` -> Typesense cluster URL (Text)
- `PUBLIC_TYPESENSE_SEARCH_API_KEY` -> search-only key (Text)
- `PUBLIC_TYPESENSE_COLLECTION` -> collection name, usually `products` (Text)
- `TYPESENSE_HOST` -> server host URL (Text)
- `TYPESENSE_ADMIN_API_KEY` -> admin key (Secret)
- `TYPESENSE_COLLECTION` -> collection name (Text)

### Is Typesense part of Phase 1?
Short answer: **No, not mandatory for Phase 1 checkout/payment/download flow**.

Typesense is only needed if your live product search experience depends on it.
Phase 1 core launch can succeed without Typesense as long as checkout, webhook, and downloads work.
---

## Step 2: Add ENV Values in Cloudflare Pages

Path:
1. Cloudflare Dashboard
2. `Workers & Pages`
3. Select your Pages project
4. `Settings` -> `Environment variables`

Add these in Production.

### Choose Variable Type Correctly (Important)
In Cloudflare, each env var can be `Text` or `Secret`.

Use `Text` for:
1. `PUBLIC_SITE_URL=https://weareamii.com`
2. `PUBLIC_SANITY_PROJECT_ID=<from Sanity>`
3. `PUBLIC_SANITY_DATASET=<from Sanity>`
4. `PUBLIC_TURNSTILE_SITE_KEY=<from Turnstile>`
5. `BREVO_NEWSLETTER_LIST_ID=<from Brevo newsletter list>` (or `BREVO_LIST_ID` legacy fallback)
6. `BREVO_CONTACT_LIST_ID=<from Brevo contact list>` (recommended)
7. `BREVO_DOUBLE_OPT_IN_TEMPLATE_ID=<from Brevo template>`
8. `BREVO_DOUBLE_OPT_IN_REDIRECT=https://weareamii.com/newsletter-success`

Use `Secret` for:
1. `FLUTTERWAVE_SECRET_KEY_TEST=<from Flutterwave test>`
2. `FLUTTERWAVE_WEBHOOK_SECRET_TEST=<from Flutterwave test webhook>`
3. `FLUTTERWAVE_SECRET_KEY_LIVE=<from Flutterwave live>`
4. `FLUTTERWAVE_WEBHOOK_SECRET_LIVE=<from Flutterwave live webhook>`
5. `SANITY_WRITE_TOKEN=<from Sanity>`
6. `ADMIN_SYNC_TOKEN=<your generated token>`
7. `TURNSTILE_SECRET_KEY=<from Turnstile>`
8. `BREVO_API_KEY=<from Brevo API keys>`

Set this `Text` variable per environment:
- Preview: `FLUTTERWAVE_ENV=test`
- Production: `FLUTTERWAVE_ENV=live`

Optional variables:
- Brevo variables above are only needed if newsletter/contact sync is enabled.
- Typesense variables -> use `Secret` for admin key, `Text` for host/collection/search key.

Important:
- After any env change, you must redeploy the Pages project.

Success check:
- Variables appear in list with correct names and no typos.

---

## Step 3: Configure Cloudflare Bindings

Path:
1. Cloudflare -> `Workers & Pages` -> your project
2. `Settings` -> `Functions` -> `Bindings`

Create these bindings exactly:
1. D1: `DB` -> `amiiverse-db`
2. R2: `ASSETS_BUCKET` -> `amiiverse-assets`
3. KV: `CACHE` -> `amiiverse-kv`

Success check:
- All 3 bindings visible with exact variable names.

---

## Step 4: Domain and DNS Setup

## 4A) Add domains to Pages
Path:
1. Cloudflare -> `Workers & Pages` -> your project
2. `Custom domains`
3. Add:
   - `weareamii.com`
   - `www.weareamii.com`

Note:
- `cms.weareamii.com` is for Sanity Studio and should not be added to this Pages project.

## 4B) DNS records
Path:
1. Cloudflare -> your zone `weareamii.com`
2. `DNS` -> `Records`

What to keep/add:
1. Keep apex/root record already connected to Pages (usually CNAME `weareamii.com -> <pages>.pages.dev`)
2. Ensure `www` record exists:
   - Type: `CNAME`
   - Name: `www`
   - Target: `weareamii.com`
   - Proxy: ON (orange cloud)
3. Add `cms` record for Sanity Studio custom domain:
   - Type: `CNAME`
   - Name: `cms`
   - Target: `cname.sanity.io`
   - Proxy: OFF (DNS only)

Do not do this:
- Do not enter `https://` in DNS target/content.
- Do not create conflicting records for same host.

Success check:
- `www` CNAME exists and is proxied.
- `cms` CNAME exists and is DNS-only.

---

## Step 4C: Connect `cms.weareamii.com` to Sanity Studio

Path:
1. Open Sanity project manage page: `https://www.sanity.io/manage/project/pxn399gi`
2. Open `Studio` -> `Host`
3. Add custom domain: `cms.weareamii.com`
4. Complete verification/SSL prompts in Sanity

Success check:
1. `https://cms.weareamii.com` opens Sanity Studio login
2. `https://weareamii.com/admin` redirects to Studio

---

## Step 5: Canonical Redirect (www to non-www)

Path:
1. Cloudflare zone -> `Rules` -> `Redirect Rules`
2. Create new rule

Use:
1. Rule name: `WWW to Apex (301)`
2. Match type: `Wildcard pattern`
3. Request URL: `https://www.weareamii.com/*`
4. Target URL: `https://weareamii.com/${1}`
5. Status code: `301`
6. Enable `Preserve query string`
7. Deploy

If you see replacement error:
- Use `${1}` (correct)
- Do not use `${uri}`

Success check:
- Visiting `https://www.weareamii.com/about` redirects to `https://weareamii.com/about`

---

## Step 6: SSL/TLS Mode

Path:
1. Cloudflare zone -> `SSL/TLS` -> `Overview`
2. Select encryption mode

Choose:
- `Full (Strict)`

Success check:
- HTTPS loads without warning.

---

## Step 7: Configure Flutterwave Webhook

Path:
1. Flutterwave -> `Settings` -> `Webhooks`

Set:
1. Version: V4
2. URL: `https://weareamii.com/api/flutterwave/webhook`
3. Secret hash: same exact value as Cloudflare env `FLUTTERWAVE_WEBHOOK_SECRET_LIVE`
4. Save

Verification note:
- Primary verification uses `flutterwave-signature` (HMAC-SHA256).
- Legacy fallback supports `verif-hash` for compatibility.
- Keep the matching webhook secret configured (`*_TEST` for preview, `*_LIVE` for production).

Do not switch webhook version unless your backend is updated for that version.

Success check:
- Settings saved without error.

---

## Step 8: Database Migrations (Local and Production)

Run in project folder:
```bash
npx wrangler d1 execute amiiverse-db --local --file=./db/migrations/0001_shop.sql
npx wrangler d1 execute amiiverse-db --local --file=./db/migrations/0002_add_r2_key.sql
npx wrangler d1 execute amiiverse-db --local --file=./db/migrations/0003_music_search.sql
npx wrangler d1 execute amiiverse-db --local --file=./db/migrations/0004_fan_leads.sql
npx wrangler d1 execute amiiverse-db --local --file=./db/migrations/0005_payment_provider.sql

npx wrangler d1 execute amiiverse-db --remote --file=./db/migrations/0001_shop.sql
npx wrangler d1 execute amiiverse-db --remote --file=./db/migrations/0002_add_r2_key.sql
npx wrangler d1 execute amiiverse-db --remote --file=./db/migrations/0003_music_search.sql
npx wrangler d1 execute amiiverse-db --remote --file=./db/migrations/0004_fan_leads.sql
npx wrangler d1 execute amiiverse-db --remote --file=./db/migrations/0005_payment_provider.sql
```

Success check:
- Commands finish without SQL errors.

---

## Step 9: Sync Products from Sanity to D1

Run:
```bash
curl -X POST https://weareamii.com/api/admin/sync-products -H "X-ADMIN-TOKEN: <ADMIN_SYNC_TOKEN>"
```

Success check:
- API returns success.

---

## Step 10: Update Legal Footer in Sanity

Path:
1. Open Sanity Studio
2. `Site Settings` -> `Navigation` -> `Footer`

Set:
1. Business Name: `MAPDY LTD`
2. Copyright Text:
   - `© {currentYear} amii<br/>Operated by MAPDY LTD`
3. Publish

Success check:
- Footer on live site shows the new legal text.

---

## Step 11: Redeploy Site

After env/domain/webhook changes:
1. Trigger a new Cloudflare Pages deploy
2. Wait until deployment is green

Success check:
- Live site loads on `https://weareamii.com`

---

## Step 12: End-to-End Test (Must Pass)

1. Open live site
2. Add product to cart
3. Refresh page (cart should persist)
4. Checkout -> should go to Flutterwave
5. Complete payment
6. Return to success page
7. Confirm order becomes `paid` in D1
8. Test download rules:
   - unpaid reference should fail
   - paid digital reference should work
9. Test reservation release:
   - create checkout and stop before payment
   - run `GET /api/cron/release-expired-reservations` after TTL window
   - confirm order status moves to `failed` and reserved stock is released

---

## Step 13: Security Checks

1. No secret keys visible in browser source/network
2. Invalid webhook hash is rejected
3. Totals calculated server-side
4. `.env` is not committed

---

## Step 14: Final Sign-off

Tick all remaining boxes in:
1. `launch-checklist.md`
2. `phase1-cloudflare-setup.txt`

Store all production secrets in a safe password manager or vault.

---

## Quick Error Fixes

### Error: "Please insert a valid IPv4"
- You entered URL text in A record value.
- Use CNAME for hostnames.

### Error: "CNAME record with that host already exists"
- You tried to add A/AAAA where CNAME already exists for same host.
- Remove conflict and keep one strategy per hostname.

### Redirect rule not deploying due to invalid replacement
- Use `${1}`, not `${uri}`.

### Webhook signature/hash failing
- The environment-matched secret in Cloudflare must match Flutterwave `Secret hash` exactly.
- Recommended: `FLUTTERWAVE_WEBHOOK_SECRET_TEST` for preview and `FLUTTERWAVE_WEBHOOK_SECRET_LIVE` for production.
- Backend accepts either `flutterwave-signature` (preferred) or legacy `verif-hash` header.

### Changes not applying
- Redeploy Pages after env edits.
