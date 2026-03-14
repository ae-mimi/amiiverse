# Compatibility Inventory

This file tracks the intentionally retained compatibility paths in the repo.

The goal is simple:
- keep behavior safe while cleanup/refactor is in progress
- document why a legacy-looking path still exists
- make future removals decision-based instead of guess-based

## Runtime Compatibility

### `product_grid` section alias
- Location: [`src/components/PageBuilder.astro`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/src/components/PageBuilder.astro)
- Current behavior: routes `product_grid` to `ShopGridBlock`
- Why it still exists: older Sanity content may still emit `_type: "product_grid"` even though the current shop path is `shop_grid`
- Safe removal condition: confirm no published pages in Sanity still contain `product_grid`

### `contact_form` section type
- Locations:
  - [`schema/page.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/schema/page.ts)
  - [`src/components/PageBuilder.astro`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/src/components/PageBuilder.astro)
  - [`src/components/blocks/ContactFormBlock.astro`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/src/components/blocks/ContactFormBlock.astro)
- Current behavior: renders the shared business contact form
- Why it still exists: `contact_form` and `contact_section` are both valid CMS section types today
- Safe removal condition: confirm editors will only use `contact_section` going forward and migrate existing pages

### `contact_section` section type
- Locations:
  - [`schema/page.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/schema/page.ts)
  - [`src/components/PageBuilder.astro`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/src/components/PageBuilder.astro)
  - [`src/components/blocks/ContactSectionBlock.astro`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/src/components/blocks/ContactSectionBlock.astro)
- Current behavior: renders the same business contact form plus business contact info cards
- Why it still exists: this is the richer business-facing contact presentation and is still used by current product decisions
- Safe removal condition: none planned right now

### `email_signup` section type
- Locations:
  - [`schema/page.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/schema/page.ts)
  - [`src/components/PageBuilder.astro`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/src/components/PageBuilder.astro)
  - [`src/components/blocks/EmailSignupBlock.astro`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/src/components/blocks/EmailSignupBlock.astro)
- Current behavior: legacy/simple subscribe form path
- Why it still exists: schema and runtime still support both `email_signup` and the newer `newsletter_signup`
- Safe removal condition: migrate all pages to `newsletter_signup` and retire the older block in Sanity

### Flutterwave legacy webhook hash fallback
- Location: [`src/pages/api/flutterwave/webhook.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/src/pages/api/flutterwave/webhook.ts)
- Current behavior: accepts preferred `flutterwave-signature` and legacy `verif-hash`
- Why it still exists: production-safe backward compatibility for webhook verification
- Safe removal condition: confirm all live webhook deliveries only use the preferred signature path

## Schema Compatibility

### Legacy follow-page schema objects
- Locations:
  - [`schema/linkStack.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/schema/linkStack.ts)
  - [`schema/profileHeader.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/schema/profileHeader.ts)
  - [`schema/index.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/schema/index.ts)
- Current behavior: still registered for follow/link-in-bio content
- Why they still exist: they are active schema types, not dead code
- Safe removal condition: only after replacing them with a new schema and migrating affected documents

### Navigation object schemas
- Locations:
  - [`schema/objects/navItem.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/schema/objects/navItem.ts)
  - [`schema/objects/navGroup.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/schema/objects/navGroup.ts)
  - [`schema/index.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/schema/index.ts)
- Current behavior: still registered in the Sanity schema bundle
- Why they still exist: schema-level compatibility; they may still be referenced by content or desk configuration
- Safe removal condition: verify they are unused in current schema fields and no documents reference them

## Environment/Platform Compatibility

### Campaign logo/favicon override queries
- Locations:
  - [`src/lib/sanity/queries.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/src/lib/sanity/queries.ts)
  - [`src/utils/global.ts`](/c:/Users/lenovo/Desktop/amii%20Assets/05%20-%20Technology/Website/amiiverse/src/utils/global.ts)
- Current behavior: apply active campaign branding overrides on top of base settings
- Why they still exist: this is live behavior, not a legacy leftover
- Safe removal condition: only if campaign-level branding is formally retired

### Cloudflare/Pages dashboard-managed workflow with Wrangler-era docs still nearby
- Locations:
  - root operational guides and setup notes
- Current behavior: runtime targets dashboard-managed Cloudflare Pages, but some docs still mention Wrangler commands for migrations and local operations
- Why it still exists: migrations and local verification still legitimately use Wrangler CLI even though deployment behavior is dashboard-managed
- Safe removal condition: only after documentation is rewritten around the final operational workflow

## Recently Removed Compatibility Debt

These were intentionally removed because they no longer had live callers:
- `ProductGridBlock` wrapper
- `ContactForm` wrapper
- client `contracts.ts`
- old local search UI/components (`SearchBar`, Typesense helpers)
- `ALL_SHOP_QUERY`
- `LEGACY_MUSIC_QUERY`
- `contact_form.endpoint`

## Rule For Future Cleanup

Before removing any compatibility path:
1. Identify the exact caller: runtime, schema, or content.
2. Migrate callers first.
3. Remove the code path.
4. Run `cmd /c npm.cmd exec tsc -- --noEmit`.
5. Run `cmd /c npm.cmd run build`.
