# Brevo Setup Guide (Production Structure)

Use this to clean your current random Brevo setup and keep website sync predictable.

## Target Folder Structure

Create these 3 folders:
1. `01_Website_Core`
2. `02_Transactional`
3. `99_Archive`

## Target List Structure

Keep only these active lists:
1. `Website - Newsletter (DOI)` in `01_Website_Core`
2. `Website - Contact Leads` in `01_Website_Core`
3. `Website - Customers` in `02_Transactional` (optional for future audience automations)

Move old/random lists to `99_Archive` first, then delete after 14 days if no automations use them.

## Environment Variable Mapping

Set in Cloudflare Pages Production:

1. `BREVO_API_KEY` (`Secret`)
2. `BREVO_NEWSLETTER_LIST_ID` (`Text`) -> ID of `Website - Newsletter (DOI)`
3. `BREVO_CONTACT_LIST_ID` (`Text`) -> ID of `Website - Contact Leads`
4. `BREVO_DOUBLE_OPT_IN_TEMPLATE_ID` (`Text`) -> DOI template ID
5. `BREVO_DOUBLE_OPT_IN_REDIRECT` (`Text`) -> e.g. `https://weareamii.com/newsletter-success`

Compatibility:
- `BREVO_LIST_ID` is still supported as fallback, but keep it only during migration.

## Required Brevo Template

Create one regular email template (the screen you shared), then fill fields like this:

1. Template name (top title): `Website - Newsletter DOI Confirmation`
2. `Content` -> click `Add content`:
   - Add headline: `Confirm your subscription`
   - Add short text: `Click the button below to confirm and join the list.`
   - Add button label: `Confirm subscription`
   - Set button link URL to: `{{ doubleoptin }}`
3. `Sender email` (required): use verified sender, for example `no-reply@weareamii.com`
4. `Sender name` (required): `amii`
5. `Subject line` (required): `Confirm your subscription`
6. `Preview text` (recommended): `One click and you're in.`
7. `Tag` (optional): `newsletter-doi`
8. `Folder` (optional): `01_Website_Core`
9. `Reply-to email address` (optional): `support@weareamii.com` (or your support inbox)
10. `Recipient personalization` (optional): leave blank
11. `Profile update form` (optional): leave default/none
12. `Tracking` (optional): keep Google Analytics tracking off unless you use it
13. `Attachments`: leave empty
14. Click `Save` (set status active when final)

Then save and copy its numeric template ID into `BREVO_DOUBLE_OPT_IN_TEMPLATE_ID`.

Important:
1. The redirect is not set inside template fields in your current UI.
2. Redirect is passed by your backend via `BREVO_DOUBLE_OPT_IN_REDIRECT` in `/api/subscribe`.

## Contact Attributes (Recommended)

Keep attributes simple and stable:
1. `FIRSTNAME` (Text)
2. `SOURCE` (Text, optional)

Do not add many custom attributes before launch.

## Cleanup Sequence (Safe)

1. Identify which list is currently used by `BREVO_LIST_ID`.
2. Create `Website - Newsletter (DOI)` and `Website - Contact Leads`.
3. Copy existing contacts into the correct new lists.
4. Set new Cloudflare env vars (`BREVO_NEWSLETTER_LIST_ID`, `BREVO_CONTACT_LIST_ID`).
5. Redeploy Pages.
6. Test both endpoints:
   - `POST /api/subscribe`
   - `POST /api/contact`
7. After successful testing, remove old unused lists.

## Post-Setup Tests

1. Newsletter submit should return success and send DOI email.
2. Confirmed email should appear in `Website - Newsletter (DOI)`.
3. Contact form submit should create/update contact in `Website - Contact Leads`.
4. Contact form should send admin notification email.
