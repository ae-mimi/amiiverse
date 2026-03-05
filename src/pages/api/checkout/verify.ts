import type { APIRoute } from "astro";
import {
    getCloudflareRuntimeEnv,
} from "../../../lib/server/cloudflareRuntimeEnv";
import {
    getPaymentProvider,
    getPaymentSecretKey,
    verifyProviderPayment,
    type PaymentProvider,
} from "../../../lib/server/paymentGateway";

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    first: () => Promise<Record<string, unknown> | null>;
    run: () => Promise<Record<string, unknown>>;
}

interface D1DatabaseLike {
    prepare: (query: string) => D1PreparedStatementLike;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export const GET: APIRoute = async ({ url, locals }) => {
    const configuredProvider = getPaymentProvider({ locals });
    const runtimeEnv = getCloudflareRuntimeEnv({ locals });
    const db = runtimeEnv.DB as D1DatabaseLike | undefined;

    const reference = url.searchParams.get("reference") || "";

    if (!reference) {
        return jsonResponse({ status: "no_reference" }, 400);
    }

    if (!db) {
        return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);
    }

    try {
        const order = await db
            .prepare(
                `SELECT id, cart_id, email, amount_kobo, status, payment_provider
                 FROM orders
                 WHERE reference = ?
                 LIMIT 1`,
            )
            .bind(reference)
            .first();

        if (!order) {
            return jsonResponse({ status: "failed", message: "Order not found" }, 404);
        }

        const orderProviderValue = String(order.payment_provider || "").toLowerCase();
        const provider: PaymentProvider =
            orderProviderValue === "flutterwave" || orderProviderValue === "paystack"
                ? (orderProviderValue as PaymentProvider)
                : configuredProvider;
        const providerSecretKey = getPaymentSecretKey({ locals }, provider);

        if (!providerSecretKey) {
            return jsonResponse(
                {
                    error:
                        provider === "flutterwave"
                            ? "Missing FLUTTERWAVE_SECRET_KEY"
                            : "Missing PAYSTACK_SECRET_KEY",
                },
                500,
            );
        }

        const verification = await verifyProviderPayment({
            provider,
            secretKey: providerSecretKey,
            reference,
        });

        if (!verification.ok) {
            return jsonResponse({
                status: "error",
                message: verification.error || "Payment verification failed",
            });
        }

        if (!verification.paid) {
            await db
                .prepare(
                    `UPDATE orders
                     SET status = CASE WHEN status = 'paid' THEN status ELSE 'failed' END,
                         provider_raw_json = ?,
                         paystack_raw_json = ?,
                         updated_at = ?
                     WHERE reference = ?`,
                )
                .bind(
                    JSON.stringify(verification.raw ?? {}),
                    JSON.stringify(verification.raw ?? {}),
                    new Date().toISOString(),
                    reference,
                )
                .run();

            return jsonResponse({
                status: "failed",
                reference,
                provider,
                providerStatus: verification.providerStatus,
            });
        }

        const nowIso = new Date().toISOString();
        const cartId = String(order.cart_id ?? "");
        const transactionId = verification.transactionId;

        await db
            .prepare(
                `UPDATE orders
                 SET status = 'paid',
                     provider_transaction_id = CASE
                         WHEN provider_transaction_id IS NULL OR provider_transaction_id = ''
                         THEN ?
                         ELSE provider_transaction_id
                     END,
                     paystack_transaction_id = CASE
                         WHEN paystack_transaction_id IS NULL OR paystack_transaction_id = ''
                         THEN ?
                         ELSE paystack_transaction_id
                     END,
                     provider_raw_json = ?,
                     paystack_raw_json = ?,
                     payment_provider = ?,
                     updated_at = ?
                 WHERE reference = ?`,
            )
            .bind(
                transactionId,
                transactionId,
                JSON.stringify(verification.raw),
                JSON.stringify(verification.raw),
                provider,
                nowIso,
                reference,
            )
            .run();

        if (cartId) {
            await db
                .prepare(
                    `UPDATE carts
                     SET status = 'checked_out', updated_at = ?
                     WHERE id = ?`,
                )
                .bind(nowIso, cartId)
                .run();
        }

        return jsonResponse({
            status: "paid",
            reference,
            provider,
            providerStatus: verification.providerStatus,
            email: verification.email || String(order.email || ""),
            amount: verification.amountKobo || Number(order.amount_kobo || 0),
            currency: verification.currency || "NGN",
            order: {
                id: String(order.id || ""),
                cartId: cartId || null,
                transactionId: transactionId || null,
            },
        });
    } catch (error: any) {
        console.error("[checkout/verify] Unexpected error", error);
        return jsonResponse(
            { status: "error", message: error?.message || "Verification failed" },
            500,
        );
    }
};
