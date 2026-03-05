import type { APIContext } from "astro";
import { getServerEnvValue } from "./cloudflareRuntimeEnv";

export type PaymentProvider = "paystack" | "flutterwave";

interface PaymentInitInput {
    provider: PaymentProvider;
    secretKey: string;
    email: string;
    amountKobo: number;
    reference: string;
    callbackUrl: string;
    orderId: string;
    cartId: string;
    phone?: string;
}

interface PaymentVerifyInput {
    provider: PaymentProvider;
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
    amountKobo: number;
    currency: string;
    error?: string;
}

export function getPaymentProvider(
    context: Pick<APIContext, "locals">,
): PaymentProvider {
    const configured = getServerEnvValue(context, "PAYMENT_PROVIDER")
        .trim()
        .toLowerCase();
    if (configured === "flutterwave") {
        return "flutterwave";
    }
    return "flutterwave";
}

export function getPaymentSecretKey(
    context: Pick<APIContext, "locals">,
    provider: PaymentProvider,
): string {
    return provider === "flutterwave"
        ? getServerEnvValue(context, "FLUTTERWAVE_SECRET_KEY")
        : getServerEnvValue(context, "PAYSTACK_SECRET_KEY");
}

export async function initializeProviderPayment(
    input: PaymentInitInput,
): Promise<PaymentInitializationResult> {
    if (input.provider === "flutterwave") {
        const flutterwaveResponse = await fetch("https://api.flutterwave.com/v3/payments", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${input.secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tx_ref: input.reference,
                amount: Number((input.amountKobo / 100).toFixed(2)),
                currency: "NGN",
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

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${input.secretKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: input.email,
            amount: input.amountKobo,
            reference: input.reference,
            callback_url: input.callbackUrl,
            metadata: {
                orderId: input.orderId,
                cartId: input.cartId,
                source: "d1_checkout",
            },
        }),
    });

    const paystackData = await paystackResponse.json().catch(() => null);
    const authorizationUrl = String(paystackData?.data?.authorization_url || "").trim();

    if (!paystackResponse.ok || !paystackData?.status || !authorizationUrl) {
        return {
            ok: false,
            authorizationUrl: "",
            raw: paystackData ?? {},
            error: paystackData?.message || "Unable to initialize Paystack transaction",
        };
    }

    return {
        ok: true,
        authorizationUrl,
        raw: paystackData,
    };
}

export async function verifyProviderPayment(
    input: PaymentVerifyInput,
): Promise<PaymentVerificationResult> {
    if (input.provider === "flutterwave") {
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
            amountKobo: Number.isFinite(amount) ? Math.round(amount * 100) : 0,
            currency: String(flutterwaveData?.data?.currency || "NGN"),
            error: flutterwaveData?.message || "Flutterwave verification failed",
        };
    }

    const paystackResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(input.reference)}`,
        {
            headers: {
                Authorization: `Bearer ${input.secretKey}`,
            },
        },
    );

    const paystackData = await paystackResponse.json().catch(() => null);
    const providerStatus = String(paystackData?.data?.status || "").trim();
    const paid = paystackResponse.ok && Boolean(paystackData?.status) && providerStatus === "success";

    return {
        ok: paystackResponse.ok && Boolean(paystackData?.status),
        paid,
        providerStatus,
        transactionId: String(paystackData?.data?.id ?? "").trim(),
        raw: paystackData ?? {},
        email: String(paystackData?.data?.customer?.email || "").trim(),
        amountKobo: Number(paystackData?.data?.amount ?? 0),
        currency: String(paystackData?.data?.currency || "NGN"),
        error: paystackData?.message || "Paystack verification failed",
    };
}
