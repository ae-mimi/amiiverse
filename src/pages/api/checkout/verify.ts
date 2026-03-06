import type { APIRoute } from "astro";
import { getCloudflareRuntimeEnv } from "../../../lib/server/cloudflareRuntimeEnv";
import { canTransitionOrderStatus } from "../../../lib/server/ecom";
import { getPaymentSecretKey, verifyProviderPayment } from "../../../lib/server/paymentGateway";

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    first: () => Promise<Record<string, unknown> | null>;
    all: () => Promise<{ results?: Array<Record<string, unknown>> }>;
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
    const runtimeEnv = getCloudflareRuntimeEnv({ locals });
    const db = runtimeEnv.DB as D1DatabaseLike | undefined;
    const reference = String(url.searchParams.get("reference") || "").trim();

    if (!reference) return jsonResponse({ status: "no_reference" }, 400);
    if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

    try {
        const order = await db
            .prepare(
                `SELECT id, cart_id, email, amount_kobo, currency_code, status
                 FROM orders
                 WHERE reference = ?
                 LIMIT 1`,
            )
            .bind(reference)
            .first();
        if (!order) {
            return jsonResponse({ status: "failed", message: "Order not found" }, 404);
        }

        const providerSecretKey = getPaymentSecretKey({ locals });
        if (!providerSecretKey) {
            return jsonResponse({ error: "Missing FLUTTERWAVE_SECRET_KEY" }, 500);
        }

        const verification = await verifyProviderPayment({
            secretKey: providerSecretKey,
            reference,
        });
        if (!verification.ok) {
            return jsonResponse({
                status: "error",
                message: verification.error || "Payment verification failed",
            });
        }

        const nowIso = new Date().toISOString();
        const currentStatus = String(order.status || "pending_payment");
        const cartId = String(order.cart_id ?? "");
        const orderId = String(order.id ?? "");

        if (!verification.paid) {
            const failAllowed = canTransitionOrderStatus(currentStatus, "failed");
            if (failAllowed) {
                await db
                    .prepare(
                        `UPDATE orders
                         SET status = 'failed',
                             provider_raw_json = ?,
                             updated_at = ?
                         WHERE id = ?`,
                    )
                    .bind(JSON.stringify(verification.raw ?? {}), nowIso, orderId)
                    .run();
            }

            return jsonResponse({
                status: "failed",
                reference,
                provider: "flutterwave",
                providerStatus: verification.providerStatus,
            });
        }

        const shouldCaptureStock = currentStatus === "pending_payment";

        if (
            canTransitionOrderStatus(currentStatus, "paid") ||
            currentStatus === "paid" ||
            currentStatus === "fulfillment_pending" ||
            currentStatus === "fulfilled"
        ) {
            await db
                .prepare(
                    `UPDATE orders
                     SET status = CASE
                         WHEN status IN ('fulfillment_pending', 'fulfilled') THEN status
                         ELSE 'paid'
                     END,
                         provider_transaction_id = CASE
                             WHEN provider_transaction_id IS NULL OR provider_transaction_id = ''
                             THEN ?
                             ELSE provider_transaction_id
                         END,
                         provider_raw_json = ?,
                         payment_provider = 'flutterwave',
                         updated_at = ?
                     WHERE id = ?`,
                )
                .bind(
                    verification.transactionId,
                    JSON.stringify(verification.raw ?? {}),
                    nowIso,
                    orderId,
                )
                .run();
        }

        await db
            .prepare(
                `UPDATE payments
                 SET provider_tx_id = CASE
                     WHEN provider_tx_id IS NULL OR provider_tx_id = ''
                     THEN ?
                     ELSE provider_tx_id
                 END,
                     status = 'paid',
                     raw_json = ?,
                     updated_at = ?
                 WHERE reference = ?`,
            )
            .bind(
                verification.transactionId,
                JSON.stringify(verification.raw ?? {}),
                nowIso,
                reference,
            )
            .run();

        if (shouldCaptureStock) {
            const items = await db
                .prepare(
                    `SELECT variant_id, quantity
                     FROM order_items
                     WHERE order_id = ?`,
                )
                .bind(orderId)
                .all();
            for (const item of items.results ?? []) {
                const variantId = String(item.variant_id || "").trim();
                const qty = Math.max(0, Number(item.quantity ?? 0));
                if (!variantId || qty <= 0) continue;
                await db
                    .prepare(
                        `UPDATE inventory
                         SET reserved = CASE WHEN reserved >= ? THEN reserved - ? ELSE 0 END,
                             on_hand = CASE WHEN on_hand >= ? THEN on_hand - ? ELSE 0 END,
                             updated_at = ?
                         WHERE variant_id = ?`,
                    )
                    .bind(qty, qty, qty, qty, nowIso, variantId)
                    .run();
            }

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

            await db
                .prepare(
                    `UPDATE orders
                     SET status = CASE
                         WHEN status = 'paid' THEN 'fulfillment_pending'
                         ELSE status
                     END,
                         updated_at = ?
                     WHERE id = ?`,
                )
                .bind(nowIso, orderId)
                .run();
        }

        return jsonResponse({
            status: "paid",
            reference,
            provider: "flutterwave",
            providerStatus: verification.providerStatus,
            email: verification.email || String(order.email || ""),
            amount: verification.amountMinor || Number(order.amount_kobo || 0),
            currency: verification.currency || String(order.currency_code || "NGN"),
            order: {
                id: orderId,
                cartId: cartId || null,
                transactionId: verification.transactionId || null,
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
