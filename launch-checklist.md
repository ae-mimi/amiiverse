# Launch Checklist (Current)

Use this checklist to finish setup for `weareamii.com` + Flutterwave + Cloudflare.

## 1. Domain and DNS
- [ ] Cloudflare Pages custom domain added: `weareamii.com`
- [ ] WWW behavior decided and set (`www.weareamii.com` -> `weareamii.com` or vice versa)
- [ ] SSL status is active for the custom domain
- [ ] Site loads on the live domain

## 2. Cloudflare Pages Bindings
- [ ] D1 binding set: `DB` -> `amiiverse-db`
- [ ] R2 binding set: `ASSETS_BUCKET` -> `amiiverse-assets`
- [ ] KV binding set: `CACHE` -> `amiiverse-kv`
- [ ] Turnstile configured and secret saved as env var

## 3. Cloudflare Environment Variables (Production)
### 3.1 Required Now
- [ ] `PAYMENT_PROVIDER=flutterwave` (`Text`)
- [ ] `FLUTTERWAVE_SECRET_KEY=...` (`Secret`)
- [ ] `FLUTTERWAVE_WEBHOOK_HASH=...` (`Secret`)
- [ ] `PUBLIC_SITE_URL=https://weareamii.com` (`Text`)
- [ ] `PUBLIC_SANITY_PROJECT_ID=...` (`Text`)
- [ ] `PUBLIC_SANITY_DATASET=...` (`Text`)
- [ ] `SANITY_WRITE_TOKEN=...` (`Secret`)
- [ ] `ADMIN_SYNC_TOKEN=...` (`Secret`)
- [ ] `PUBLIC_TURNSTILE_SITE_KEY=...` (`Text`)
- [ ] `TURNSTILE_SECRET_KEY=...` (`Secret`)

### 3.2 Optional (Enable Only If Feature Is Used)
- [ ] Brevo vars set (if newsletter/contact sync is enabled):
  - `BREVO_API_KEY` (`Secret`)
  - `BREVO_NEWSLETTER_LIST_ID` (`Text`) or `BREVO_LIST_ID` (`Text`, legacy fallback)
  - `BREVO_CONTACT_LIST_ID` (`Text`, optional but recommended)
  - `BREVO_DOUBLE_OPT_IN_TEMPLATE_ID` (`Text`)
  - `BREVO_DOUBLE_OPT_IN_REDIRECT` (`Text`)
- [ ] Typesense vars set (if Typesense search is enabled):
  - `PUBLIC_TYPESENSE_HOST` (`Text`)
  - `PUBLIC_TYPESENSE_SEARCH_API_KEY` (`Text`)
  - `PUBLIC_TYPESENSE_COLLECTION` (`Text`)
  - `TYPESENSE_HOST` (`Text`)
  - `TYPESENSE_ADMIN_API_KEY` (`Secret`)
  - `TYPESENSE_COLLECTION` (`Text`)

### 3.3 Cleanup
- [ ] (Optional) Any old `PAYSTACK_*` env vars removed if no longer needed
- [ ] (Optional) Any old `PUBLIC_PLAUSIBLE_*` env vars removed

## 4. Flutterwave Webhook
- [ ] In Flutterwave Webhooks page, set URL to:
  - `https://weareamii.com/api/flutterwave/webhook`
- [ ] Secret hash generated and saved in Flutterwave
- [ ] Same value copied to Cloudflare env var: `FLUTTERWAVE_WEBHOOK_HASH`
- [ ] Saved webhook settings in Flutterwave
- [ ] Do not switch webhook version unless backend is updated for it

## 5. Database / Backend
- [ ] D1 migrations applied locally
- [ ] D1 migrations applied remotely
- [ ] Product sync endpoint works:
  - `POST /api/admin/sync-products` with `X-ADMIN-TOKEN`
- [ ] Products present in `products_cache`
- [ ] Digital products include valid `r2_key`

## 6. Sanity Content and Branding
- [ ] Site Settings -> Footer -> Business Name set to `MAPDY LTD`
- [ ] Site Settings -> Footer -> Copyright Text set to:
  - `© {currentYear} amii<br/>Operated by MAPDY LTD`
- [ ] Publish Site Settings
- [ ] Check frontend footer reflects new text

## 7. Functional QA (Production)
- [ ] Shop grid loads correctly
- [ ] Cart persists across refresh
- [ ] Checkout redirects to Flutterwave
- [ ] Successful payment marks order as `paid` in D1
- [ ] Webhook request is accepted (no signature/hash errors)
- [ ] Download endpoint blocks unpaid orders
- [ ] Download endpoint works for paid digital orders

## 8. Security QA
- [ ] No secrets exposed in frontend bundle / page source
- [ ] Webhook route rejects invalid hash
- [ ] Totals are validated server-side (not trusted from client)
- [ ] `.env` is not committed

## 9. Final Phase 1 Sign-off
- [ ] `phase1-cloudflare-setup.txt` checkboxes all completed
- [ ] End-to-end payment + download flow tested once in live environment
- [ ] Backup admin credentials and env vars in secure vault

## Notes
- Current codebase default payment provider is Flutterwave.
- Plausible has been removed/disabled in app configuration.
- Current target live domain is `weareamii.com`.
- Typesense is **not mandatory** for Phase 1 checkout/payment/download flow.
