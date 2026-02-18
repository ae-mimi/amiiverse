/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
    readonly ADMIN_SYNC_TOKEN?: string;
    readonly PAYSTACK_SECRET_KEY?: string;
    readonly SANITY_WRITE_TOKEN?: string;
    readonly BREVO_API_KEY?: string;
    readonly BREVO_LIST_ID?: string;
    readonly BREVO_DOUBLE_OPT_IN_TEMPLATE_ID?: string;
    readonly BREVO_DOUBLE_OPT_IN_REDIRECT?: string;
    readonly MEDUSA_ADMIN_API_TOKEN?: string;
    readonly PUBLIC_MEDUSA_BACKEND_URL?: string;
    readonly PUBLIC_TYPESENSE_HOST?: string;
    readonly PUBLIC_TYPESENSE_SEARCH_API_KEY?: string;
    readonly PUBLIC_TYPESENSE_SEARCH_KEY?: string;
    readonly PUBLIC_TYPESENSE_COLLECTION?: string;
    readonly TYPESENSE_HOST?: string;
    readonly TYPESENSE_ADMIN_API_KEY?: string;
    readonly TYPESENSE_COLLECTION?: string;
    readonly PUBLIC_PLAUSIBLE_DOMAIN?: string;
    readonly PUBLIC_PLAUSIBLE_SRC?: string;
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
                PAYSTACK_SECRET_KEY?: string;
                SANITY_WRITE_TOKEN?: string;
                BREVO_API_KEY?: string;
                BREVO_LIST_ID?: string;
                BREVO_DOUBLE_OPT_IN_TEMPLATE_ID?: string;
                BREVO_DOUBLE_OPT_IN_REDIRECT?: string;
                MEDUSA_ADMIN_API_TOKEN?: string;
                PUBLIC_MEDUSA_BACKEND_URL?: string;
                PUBLIC_TYPESENSE_HOST?: string;
                PUBLIC_TYPESENSE_SEARCH_API_KEY?: string;
                PUBLIC_TYPESENSE_COLLECTION?: string;
                PUBLIC_PLAUSIBLE_DOMAIN?: string;
                PUBLIC_PLAUSIBLE_SRC?: string;
                PUBLIC_TURNSTILE_SITE_KEY?: string;
                TURNSTILE_SECRET_KEY?: string;
                DB?: unknown;
                CACHE?: unknown;
                ASSETS_BUCKET?: unknown;
            };
        };
    }
}
