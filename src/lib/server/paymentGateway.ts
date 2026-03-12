import type { APIContext } from "astro";
import { getServerEnvValue } from "./cloudflareRuntimeEnv";

interface PaymentInitInput {
    secretKey: string;
    email: string;
    amountMinor: number;
    currency: "NGN" | "USD" | "GBP";
    reference: string;
    callbackUrl: string;
    orderId: string;
    cartId: string;
    phone?: string;
}

interface PaymentVerifyInput {
    secretKey: string;
    reference: string;
}

export interface PaymentInitializationResult {
    ok: boolean;
    authorizationUrl: string;
    raw: any;
    error?: string;
}

export interface PaymentVerificationResult {
    ok: boolean;
    paid: boolean;
    providerStatus: string;
    transactionId: string;
    raw: any;
    email: string;
    amountMinor: number;
    currency: string;
    error?: string;
}

export type FlutterwaveEnvironment = "test" | "live";

function normalizeFlutterwaveEnvironment(raw: string): FlutterwaveEnvironment | null {
    const value = raw.trim().toLowerCase();
    if (value === "test" || value === "sandbox" || value === "preview") return "test";
    if (value === "live" || value === "production" || value === "prod") return "live";
    return null;
}

export function getFlutterwaveEnvironment(
    context: Pick<APIContext, "locals">,
): FlutterwaveEnvironment {
    const explicit = normalizeFlutterwaveEnvironment(
        getServerEnvValue(context, "FLUTTERWAVE_ENV"),
    );
    if (explicit) return explicit;

    const pagesUrl = getServerEnvValue(context, "CF_PAGES_URL").toLowerCase();
    if (pagesUrl.includes(".pages.dev")) return "test";

    const nodeEnv = getServerEnvValue(context, "NODE_ENV").toLowerCase();
    if (nodeEnv === "development" || nodeEnv === "test") return "test";

    return "live";
}

export function getPaymentSecretKey(
    context: Pick<APIContext, "locals">,
): string {
    const legacy = getServerEnvValue(context, "FLUTTERWAVE_SECRET_KEY");
    if (legacy) return legacy;

    const environment = getFlutterwaveEnvironment(context);
    if (environment === "test") {
        return (
            getServerEnvValue(context, "FLUTTERWAVE_SECRET_KEY_TEST") ||
            getServerEnvValue(context, "FLUTTERWAVE_SECRET_KEY_LIVE")
        );
    }

    return (
        getServerEnvValue(context, "FLUTTERWAVE_SECRET_KEY_LIVE") ||
        getServerEnvValue(context, "FLUTTERWAVE_SECRET_KEY_TEST")
    );
}

export function getWebhookSecret(
    context: Pick<APIContext, "locals">,
): string {
    const legacy = getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_HASH");
    if (legacy) return legacy;

    const normalizedLegacySecret = getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_SECRET");
    if (normalizedLegacySecret) return normalizedLegacySecret;

    const environment = getFlutterwaveEnvironment(context);
    if (environment === "test") {
        return (
            getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_SECRET_TEST") ||
            getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_HASH_TEST") ||
            getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_SECRET_LIVE") ||
            getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_HASH_LIVE")
        );
    }

    return (
        getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_SECRET_LIVE") ||
        getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_HASH_LIVE") ||
        getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_SECRET_TEST") ||
        getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_HASH_TEST")
    );
}

export async function initializeProviderPayment(
    input: PaymentInitInput,
): Promise<PaymentInitializationResult> {
    const flutterwaveResponse = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${input.secretKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            tx_ref: input.reference,
            amount: Number((input.amountMinor / 100).toFixed(2)),
            currency: input.currency,
            redirect_url: input.callbackUrl,
            customer: {
                email: input.email,
                phonenumber: input.phone || undefined,
                name: input.email.split("@")[0] || "Customer",
            },
            customizations: {
                title: "Amiiverse Checkout",
                description: `Order ${input.reference}`,
            },
            meta: {
                orderId: input.orderId,
                cartId: input.cartId,
                source: "d1_checkout",
            },
        }),
    });

    const flutterwaveData = await flutterwaveResponse.json().catch(() => null);
    const authorizationUrl = String(flutterwaveData?.data?.link || "").trim();

    if (!flutterwaveResponse.ok || flutterwaveData?.status !== "success" || !authorizationUrl) {
        return {
            ok: false,
            authorizationUrl: "",
            raw: flutterwaveData ?? {},
            error:
                flutterwaveData?.message ||
                "Unable to initialize Flutterwave transaction",
        };
    }

    return {
        ok: true,
        authorizationUrl,
        raw: flutterwaveData,
    };
}

export async function verifyProviderPayment(
    input: PaymentVerifyInput,
): Promise<PaymentVerificationResult> {
    const flutterwaveResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(input.reference)}`,
        {
            headers: {
                Authorization: `Bearer ${input.secretKey}`,
            },
        },
    );

    const flutterwaveData = await flutterwaveResponse.json().catch(() => null);
    const providerStatus = String(flutterwaveData?.data?.status || "").trim();
    const paid =
        flutterwaveResponse.ok &&
        flutterwaveData?.status === "success" &&
        providerStatus === "successful";
    const amount = Number(flutterwaveData?.data?.amount ?? 0);

    return {
        ok: flutterwaveResponse.ok && flutterwaveData?.status === "success",
        paid,
        providerStatus,
        transactionId: String(flutterwaveData?.data?.id ?? "").trim(),
        raw: flutterwaveData ?? {},
        email: String(flutterwaveData?.data?.customer?.email || "").trim(),
        amountMinor: Number.isFinite(amount) ? Math.round(amount * 100) : 0,
        currency: String(flutterwaveData?.data?.currency || "NGN"),
        error: flutterwaveData?.message || "Flutterwave verification failed",
    };
}
