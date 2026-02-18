import type { APIRoute } from "astro";
import {
    getCloudflareRuntimeEnv,
    getServerEnvValue,
} from "../../../lib/server/cloudflareRuntimeEnv";

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
    const PAYSTACK_SECRET_KEY = getServerEnvValue(
        { locals },
        "PAYSTACK_SECRET_KEY",
    );
    const runtimeEnv = getCloudflareRuntimeEnv({ locals });
    const db = runtimeEnv.DB as D1DatabaseLike | undefined;

    const reference = url.searchParams.get("reference") || "";

    if (!reference) {
        return jsonResponse({ status: "no_reference" }, 400);
    }

    if (!PAYSTACK_SECRET_KEY) {
        return jsonResponse({ error: "Missing PAYSTACK_SECRET_KEY" }, 500);
    }
    if (!db) {
        return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);
    }

    try {
        const order = await db
            .prepare(
                `SELECT id, cart_id, email, amount_kobo, status
                 FROM orders
                 WHERE reference = ?
                 LIMIT 1`,
            )
            .bind(reference)
            .first();

        if (!order) {
            return jsonResponse({ status: "failed", message: "Order not found" }, 404);
        }

        const paystackResponse = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            },
        );

        const paystackData = await paystackResponse.json();
        const paystackStatus = paystackData?.data?.status;

        if (!paystackResponse.ok || !paystackData?.status) {
            return jsonResponse({
                status: "error",
                message: paystackData?.message || "Paystack verification failed",
            });
        }

        if (paystackStatus !== "success") {
            await db
                .prepare(
                    `UPDATE orders
                     SET status = CASE WHEN status = 'paid' THEN status ELSE 'failed' END,
                         paystack_raw_json = ?,
                         updated_at = ?
                     WHERE reference = ?`,
                )
                .bind(
                    JSON.stringify(paystackData ?? {}),
                    new Date().toISOString(),
                    reference,
                )
                .run();

            return jsonResponse({
                status: "failed",
                reference,
                paystackStatus,
            });
        }

        const nowIso = new Date().toISOString();
        const cartId = String(order.cart_id ?? "");
        const transactionId = String(paystackData?.data?.id ?? "").trim();

        await db
            .prepare(
                `UPDATE orders
                 SET status = 'paid',
                     paystack_transaction_id = CASE
                         WHEN paystack_transaction_id IS NULL OR paystack_transaction_id = ''
                         THEN ?
                         ELSE paystack_transaction_id
                     END,
                     paystack_raw_json = ?,
                     updated_at = ?
                 WHERE reference = ?`,
            )
            .bind(
                transactionId,
                JSON.stringify(paystackData),
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
            paystackStatus,
            email: paystackData?.data?.customer?.email || String(order.email || ""),
            amount: paystackData?.data?.amount ?? Number(order.amount_kobo || 0),
            currency: paystackData?.data?.currency || "NGN",
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
