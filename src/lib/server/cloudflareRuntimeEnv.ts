import type { APIContext } from "astro";

export interface CloudflareRuntimeEnv {
    ADMIN_SYNC_TOKEN?: string;
    PHASE2_ECOM_ENABLED?: string;
    FLUTTERWAVE_ENV?: string;
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
}

type RuntimeLocals = {
    runtime?: {
        env?: CloudflareRuntimeEnv;
    };
};

export function getCloudflareRuntimeEnv(
    context: Pick<APIContext, "locals">,
): CloudflareRuntimeEnv {
    return ((context.locals as RuntimeLocals)?.runtime?.env ??
        {}) as CloudflareRuntimeEnv;
}

export function getServerEnvValue(
    context: Pick<APIContext, "locals">,
    key: keyof CloudflareRuntimeEnv,
): string {
    const runtimeValue = getCloudflareRuntimeEnv(context)[key];
    if (typeof runtimeValue === "string" && runtimeValue.length > 0) {
        return runtimeValue;
    }

    const buildValue = import.meta.env[key as keyof ImportMetaEnv];
    return typeof buildValue === "string" ? buildValue : "";
}
