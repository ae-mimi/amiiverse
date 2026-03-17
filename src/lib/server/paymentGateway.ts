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
    encryptedCardNumber: string;
    encryptedExpiryMonth: string;
    encryptedExpiryYear: string;
    encryptedCvv: string;
    cardNonce: string;
}

interface PaymentVerifyInput {
    authorizationKey: string;
    reference: string;
    transactionId?: string;
}

export interface PaymentInitializationResult {
    ok: boolean;
    authorizationUrl: string;
    transactionId: string;
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
        | "FLUTTERWAVE_ENCRYPTION_KEY"
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

export function getFlutterwaveEncryptionKey(
    context: Pick<APIContext, "locals">,
): string {
    return getScopedEnvValue(context, "FLUTTERWAVE_ENCRYPTION_KEY");
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

function getFlutterwaveApiBaseUrl(context: Pick<APIContext, "locals">): string {
    return getFlutterwaveEnv(context) === "live"
        ? "https://api.flutterwave.cloud"
        : "https://developersandbox-api.flutterwave.com";
}

export async function initializeProviderPayment(
    context: Pick<APIContext, "locals">,
    input: PaymentInitInput,
): Promise<PaymentInitializationResult> {
    const flutterwaveResponse = await fetch(`${getFlutterwaveApiBaseUrl(context)}/charges`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${input.authorizationKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            reference: input.reference,
            tx_ref: input.reference,
            amount: Number((input.amountMinor / 100).toFixed(2)).toFixed(2),
            currency: input.currency,
            customer: {
                name: input.customerName || input.email.split("@")[0] || "Customer",
                email: input.email,
                phone_number: input.phone || undefined,
            },
            payment_method: {
                type: "card",
                card: {
                    encrypted_card_number: input.encryptedCardNumber,
                    encrypted_expiry_month: input.encryptedExpiryMonth,
                    encrypted_expiry_year: input.encryptedExpiryYear,
                    encrypted_cvv: input.encryptedCvv,
                    nonce: input.cardNonce,
                },
            },
            auth: {
                type: "3ds",
                redirect_url: input.callbackUrl,
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
    const authorizationUrl = String(
        flutterwaveData?.data?.next_action?.redirect_url ||
            flutterwaveData?.data?.link ||
            "",
    ).trim();
    const transactionId = String(flutterwaveData?.data?.id || "").trim();
    const providerStatus = String(flutterwaveData?.data?.status || "").trim().toLowerCase();
    const chargeSucceeded = ["successful", "completed", "paid"].includes(providerStatus);

    if (
        !flutterwaveResponse.ok ||
        (!authorizationUrl && !transactionId) ||
        (!authorizationUrl && !chargeSucceeded)
    ) {
        return {
            ok: false,
            authorizationUrl: "",
            transactionId,
            raw: flutterwaveData ?? {},
            error:
                flutterwaveData?.message ||
                "Unable to initialize Flutterwave transaction",
        };
    }

    return {
        ok: true,
        authorizationUrl: authorizationUrl || input.callbackUrl,
        transactionId,
        raw: flutterwaveData,
    };
}

export async function verifyProviderPayment(
    context: Pick<APIContext, "locals">,
    input: PaymentVerifyInput,
): Promise<PaymentVerificationResult> {
    if (!input.transactionId) {
        return {
            ok: false,
            paid: false,
            providerStatus: "",
            transactionId: "",
            raw: {},
            email: "",
            amountMinor: 0,
            currency: "NGN",
            error: "Missing Flutterwave charge identifier",
        };
    }

    const flutterwaveResponse = await fetch(
        `${getFlutterwaveApiBaseUrl(context)}/charges/${encodeURIComponent(input.transactionId)}`,
        {
            headers: {
                Authorization: `Bearer ${input.authorizationKey}`,
            },
        },
    );

    const flutterwaveData = await flutterwaveResponse.json().catch(() => null);
    const providerStatus = String(flutterwaveData?.data?.status || "").trim().toLowerCase();
    const paid =
        flutterwaveResponse.ok &&
        ["successful", "completed", "paid"].includes(providerStatus);
    const amount = Number(
        flutterwaveData?.data?.amount?.value ??
            flutterwaveData?.data?.amount ??
            0,
    );

    return {
        ok: flutterwaveResponse.ok,
        paid,
        providerStatus,
        transactionId: String(flutterwaveData?.data?.id ?? input.transactionId).trim(),
        raw: flutterwaveData ?? {},
        email: String(flutterwaveData?.data?.customer?.email || "").trim(),
        amountMinor: Number.isFinite(amount) ? Math.round(amount * 100) : 0,
        currency: String(
            flutterwaveData?.data?.amount?.currency ||
                flutterwaveData?.data?.currency ||
                "NGN",
        ),
        error: flutterwaveData?.message || "Flutterwave verification failed",
    };
}
