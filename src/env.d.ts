/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
    readonly ADMIN_SYNC_TOKEN?: string;
    readonly PHASE2_ECOM_ENABLED?: string;
    readonly FLUTTERWAVE_ENV?: string;
    readonly FLUTTERWAVE_CLIENT_ID?: string;
    readonly FLUTTERWAVE_CLIENT_ID_LIVE?: string;
    readonly FLUTTERWAVE_CLIENT_ID_TEST?: string;
    readonly FLUTTERWAVE_CLIENT_SECRET?: string;
    readonly FLUTTERWAVE_CLIENT_SECRET_LIVE?: string;
    readonly FLUTTERWAVE_CLIENT_SECRET_TEST?: string;
    readonly FLUTTERWAVE_ENCRYPTION_KEY?: string;
    readonly FLUTTERWAVE_ENCRYPTION_KEY_LIVE?: string;
    readonly FLUTTERWAVE_ENCRYPTION_KEY_TEST?: string;
    readonly FLUTTERWAVE_SECRET_KEY?: string;
    readonly FLUTTERWAVE_SECRET_KEY_LIVE?: string;
    readonly FLUTTERWAVE_SECRET_KEY_TEST?: string;
    readonly FLUTTERWAVE_WEBHOOK_HASH?: string;
    readonly FLUTTERWAVE_WEBHOOK_SECRET_LIVE?: string;
    readonly FLUTTERWAVE_WEBHOOK_SECRET_TEST?: string;
    readonly SANITY_WRITE_TOKEN?: string;
    readonly BREVO_API_KEY?: string;
    readonly BREVO_LIST_ID?: string;
    readonly BREVO_NEWSLETTER_LIST_ID?: string;
    readonly BREVO_CONTACT_LIST_ID?: string;
    readonly BREVO_DOUBLE_OPT_IN_TEMPLATE_ID?: string;
    readonly BREVO_DOUBLE_OPT_IN_REDIRECT?: string;
    readonly PUBLIC_TYPESENSE_HOST?: string;
    readonly PUBLIC_TYPESENSE_SEARCH_API_KEY?: string;
    readonly PUBLIC_TYPESENSE_SEARCH_KEY?: string;
    readonly PUBLIC_TYPESENSE_COLLECTION?: string;
    readonly TYPESENSE_HOST?: string;
    readonly TYPESENSE_ADMIN_API_KEY?: string;
    readonly TYPESENSE_COLLECTION?: string;
    readonly PUBLIC_SANITY_PROJECT_ID?: string;
    readonly PUBLIC_SANITY_DATASET?: string;
    readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare namespace App {
    interface Locals {
        runtime?: {
            env?: {
                ADMIN_SYNC_TOKEN?: string;
                PHASE2_ECOM_ENABLED?: string;
                FLUTTERWAVE_ENV?: string;
                FLUTTERWAVE_CLIENT_ID?: string;
                FLUTTERWAVE_CLIENT_ID_LIVE?: string;
                FLUTTERWAVE_CLIENT_ID_TEST?: string;
                FLUTTERWAVE_CLIENT_SECRET?: string;
                FLUTTERWAVE_CLIENT_SECRET_LIVE?: string;
                FLUTTERWAVE_CLIENT_SECRET_TEST?: string;
                FLUTTERWAVE_ENCRYPTION_KEY?: string;
                FLUTTERWAVE_ENCRYPTION_KEY_LIVE?: string;
                FLUTTERWAVE_ENCRYPTION_KEY_TEST?: string;
                FLUTTERWAVE_SECRET_KEY?: string;
                FLUTTERWAVE_SECRET_KEY_LIVE?: string;
                FLUTTERWAVE_SECRET_KEY_TEST?: string;
                FLUTTERWAVE_WEBHOOK_HASH?: string;
                FLUTTERWAVE_WEBHOOK_SECRET_LIVE?: string;
                FLUTTERWAVE_WEBHOOK_SECRET_TEST?: string;
                SANITY_WRITE_TOKEN?: string;
                BREVO_API_KEY?: string;
                BREVO_LIST_ID?: string;
                BREVO_NEWSLETTER_LIST_ID?: string;
                BREVO_CONTACT_LIST_ID?: string;
                BREVO_DOUBLE_OPT_IN_TEMPLATE_ID?: string;
                BREVO_DOUBLE_OPT_IN_REDIRECT?: string;
                PUBLIC_TYPESENSE_HOST?: string;
                PUBLIC_TYPESENSE_SEARCH_API_KEY?: string;
                PUBLIC_TYPESENSE_COLLECTION?: string;
                PUBLIC_SANITY_PROJECT_ID?: string;
                PUBLIC_SANITY_DATASET?: string;
                PUBLIC_TURNSTILE_SITE_KEY?: string;
                TURNSTILE_SECRET_KEY?: string;
                DB?: unknown;
                CACHE?: unknown;
                ASSETS_BUCKET?: unknown;
            };
        };
    }
}
