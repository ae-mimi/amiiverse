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

interface CartWithTotalsRow {
    id: string;
    email?: string | null;
    status: "open" | "checked_out" | "abandoned";
    total_ngn: number;
    item_count: number;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function createReference(): string {
    const random = Math.random().toString(36).slice(2, 10);
    return `amii_${Date.now()}_${random}`;
}

function createOrderId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const PAYSTACK_SECRET_KEY = getServerEnvValue(
            { locals },
            "PAYSTACK_SECRET_KEY",
        );
        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;

        if (!PAYSTACK_SECRET_KEY) {
            return jsonResponse({ error: "Missing PAYSTACK_SECRET_KEY" }, 500);
        }
        if (!db) {
            return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);
        }

        const body = await request.json().catch(() => ({}));
        const cartId = String(body?.cartId || "").trim();
        const email = String(body?.email || "").trim().toLowerCase();

        if (!cartId || !email) {
            return jsonResponse({ error: "cartId and email are required" }, 400);
        }

        const cartRow = (await db
            .prepare(
                `SELECT
                    c.id,
                    c.email,
                    c.status,
                    COALESCE(SUM(ci.quantity * ci.unit_price_ngn), 0) AS total_ngn,
                    COUNT(ci.id) AS item_count
                 FROM carts c
                 LEFT JOIN cart_items ci ON ci.cart_id = c.id
                 WHERE c.id = ?
                 GROUP BY c.id, c.email, c.status
                 LIMIT 1`,
            )
            .bind(cartId)
            .first()) as CartWithTotalsRow | null;

        if (!cartRow) {
            return jsonResponse({ error: "Cart not found" }, 404);
        }

        if (cartRow.status !== "open") {
            return jsonResponse(
                { error: `Cart is not open (status: ${cartRow.status})` },
                409,
            );
        }

        if (Number(cartRow.item_count || 0) <= 0) {
            return jsonResponse({ error: "Cart has no items" }, 400);
        }

        const totalNgn = Number(cartRow.total_ngn || 0);
        const amountKobo = Math.round(totalNgn * 100);
        if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
            return jsonResponse({ error: "Cart total must be greater than zero" }, 400);
        }

        const nowIso = new Date().toISOString();
        const reference = createReference();
        const orderId = createOrderId();
        const callbackUrl = `${new URL(request.url).origin}/shop/success?reference=${encodeURIComponent(reference)}`;

        await db
            .prepare(
                `INSERT INTO orders (
                    id,
                    cart_id,
                    reference,
                    email,
                    amount_kobo,
                    status,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
            )
            .bind(orderId, cartId, reference, email, amountKobo, nowIso, nowIso)
            .run();

        await db
            .prepare(
                `UPDATE carts
                 SET email = ?, updated_at = ?
                 WHERE id = ?`,
            )
            .bind(email, nowIso, cartId)
            .run();

        const paystackResponse = await fetch(
            "https://api.paystack.co/transaction/initialize",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    amount: amountKobo,
                    reference,
                    callback_url: callbackUrl,
                    metadata: {
                        orderId,
                        cartId,
                        source: "d1_checkout",
                    },
                }),
            },
        );

        const paystackData = await paystackResponse.json().catch(() => null);
        const authorizationUrl = paystackData?.data?.authorization_url;

        if (!paystackResponse.ok || !paystackData?.status || !authorizationUrl) {
            await db
                .prepare(
                    `UPDATE orders
                     SET status = 'failed', paystack_raw_json = ?, updated_at = ?
                     WHERE id = ?`,
                )
                .bind(JSON.stringify(paystackData ?? {}), new Date().toISOString(), orderId)
                .run();

            return jsonResponse(
                {
                    error:
                        paystackData?.message ||
                        "Unable to initialize Paystack transaction",
                },
                502,
            );
        }

        return jsonResponse({
            authorization_url: authorizationUrl,
            reference,
        });
    } catch (error: any) {
        console.error("[checkout/initialize] Unexpected error", error);
        return jsonResponse(
            { error: error?.message || "Checkout initialization failed" },
            500,
        );
    }
};
