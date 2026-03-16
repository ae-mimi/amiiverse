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
    customerName?: string;
    shippingAddress?: Record<string, string>;
    deliveryOption?: Record<string, string | number>;
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

export function getPaymentSecretKey(
    context: Pick<APIContext, "locals">,
): string {
    return getServerEnvValue(context, "FLUTTERWAVE_SECRET_KEY");
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
                shippingAddress: input.shippingAddress,
                deliveryOption: input.deliveryOption,
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
