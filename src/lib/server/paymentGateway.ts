import type { APIContext } from "astro";
import {
    getCloudflareRuntimeEnv,
    getServerEnvValue,
} from "./cloudflareRuntimeEnv";

interface PaymentInitInput {
    authorizationKey: string;
    email: string;
    amountMinor: number;
    currency: "NGN" | "USD" | "GBP";
    reference: string;
    callbackUrl: string;
    orderId: string;
    cartId: string;
    phone?: string;
    customerName?: string;
    shippingAddress?: Record<string, string>;
    deliveryOption?: Record<string, string | number>;
}

interface PaymentVerifyInput {
    authorizationKey: string;
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

function getFlutterwaveEnv(
    context: Pick<APIContext, "locals">,
): "live" | "test" | "" {
    const runtimeEnv = getCloudflareRuntimeEnv(context);
    const flutterwaveEnv = String(
        runtimeEnv.FLUTTERWAVE_ENV || import.meta.env.FLUTTERWAVE_ENV || "",
    )
        .trim()
        .toLowerCase();

    if (flutterwaveEnv === "live" || flutterwaveEnv === "test") {
        return flutterwaveEnv;
    }

    return "";
}

function getScopedEnvValue(
    context: Pick<APIContext, "locals">,
    baseKey:
        | "FLUTTERWAVE_CLIENT_ID"
        | "FLUTTERWAVE_CLIENT_SECRET"
        | "FLUTTERWAVE_SECRET_KEY",
): string {
    const flutterwaveEnv = getFlutterwaveEnv(context);

    if (flutterwaveEnv === "live") {
        return (
            getServerEnvValue(context, `${baseKey}_LIVE`) ||
            getServerEnvValue(context, baseKey)
        );
    }

    if (flutterwaveEnv === "test") {
        return (
            getServerEnvValue(context, `${baseKey}_TEST`) ||
            getServerEnvValue(context, baseKey)
        );
    }

    return getServerEnvValue(context, baseKey);
}

export function getPaymentSecretKey(
    context: Pick<APIContext, "locals">,
): string {
    return getScopedEnvValue(context, "FLUTTERWAVE_SECRET_KEY");
}

function getFlutterwaveClientId(
    context: Pick<APIContext, "locals">,
): string {
    return getScopedEnvValue(context, "FLUTTERWAVE_CLIENT_ID");
}

function getFlutterwaveClientSecret(
    context: Pick<APIContext, "locals">,
): string {
    return getScopedEnvValue(context, "FLUTTERWAVE_CLIENT_SECRET");
}

export async function getPaymentAuthorizationKey(
    context: Pick<APIContext, "locals">,
): Promise<string> {
    const clientId = getFlutterwaveClientId(context);
    const clientSecret = getFlutterwaveClientSecret(context);

    if (clientId && clientSecret) {
        const tokenResponse = await fetch(
            "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "client_credentials",
                    client_id: clientId,
                    client_secret: clientSecret,
                }),
            },
        );

        const tokenData = await tokenResponse.json().catch(() => null);
        const accessToken = String(tokenData?.access_token || "").trim();

        if (!tokenResponse.ok || !accessToken) {
            throw new Error(
                String(tokenData?.error_description || tokenData?.message || "Unable to authenticate with Flutterwave").trim(),
            );
        }

        return accessToken;
    }

    return getPaymentSecretKey(context);
}

export function getPaymentWebhookSecret(
    context: Pick<APIContext, "locals">,
): string {
    const flutterwaveEnv = getFlutterwaveEnv(context);

    if (flutterwaveEnv === "live") {
        return (
            getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_SECRET_LIVE") ||
            getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_HASH")
        );
    }

    if (flutterwaveEnv === "test") {
        return (
            getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_SECRET_TEST") ||
            getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_HASH")
        );
    }

    return getServerEnvValue(context, "FLUTTERWAVE_WEBHOOK_HASH");
}

export async function initializeProviderPayment(
    input: PaymentInitInput,
): Promise<PaymentInitializationResult> {
    const flutterwaveResponse = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${input.authorizationKey}`,
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
                name: input.customerName || input.email.split("@")[0] || "Customer",
            },
            customizations: {
                title: "Amiiverse Checkout",
                description: `Order ${input.reference}`,
            },
            meta: {
                orderId: input.orderId,
                cartId: input.cartId,
                source: "d1_checkout",
                shippingAddress: input.shippingAddress
                    ? JSON.stringify(input.shippingAddress)
                    : undefined,
                deliveryOption: input.deliveryOption
                    ? JSON.stringify(input.deliveryOption)
                    : undefined,
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
                Authorization: `Bearer ${input.authorizationKey}`,
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
