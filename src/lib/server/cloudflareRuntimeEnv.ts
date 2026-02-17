import type { APIContext } from "astro";

export interface CloudflareRuntimeEnv {
    ADMIN_SYNC_TOKEN?: string;
    PAYSTACK_SECRET_KEY?: string;
    SANITY_WRITE_TOKEN?: string;
    BREVO_API_KEY?: string;
    MEDUSA_ADMIN_API_TOKEN?: string;
    PUBLIC_MEDUSA_BACKEND_URL?: string;
    PUBLIC_TYPESENSE_HOST?: string;
    PUBLIC_TYPESENSE_SEARCH_API_KEY?: string;
    PUBLIC_TYPESENSE_COLLECTION?: string;
    PUBLIC_PLAUSIBLE_DOMAIN?: string;
    PUBLIC_PLAUSIBLE_SRC?: string;
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
