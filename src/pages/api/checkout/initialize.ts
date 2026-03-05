import type { APIRoute } from "astro";
import {
    getCloudflareRuntimeEnv,
} from "../../../lib/server/cloudflareRuntimeEnv";
import {
    getPaymentSecretKey,
    initializeProviderPayment,
} from "../../../lib/server/paymentGateway";

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
        const providerSecretKey = getPaymentSecretKey({ locals });
        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;

        if (!providerSecretKey) {
            return jsonResponse({ error: "Missing FLUTTERWAVE_SECRET_KEY" }, 500);
        }
        if (!db) {
            return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);
        }

        const body = await request.json().catch(() => ({}));
        const cartId = String(body?.cartId || "").trim();
        const email = String(body?.email || "").trim().toLowerCase();
        const phone = String(body?.phone || "").trim();

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
                    payment_provider,
                    status,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
            )
            .bind(
                orderId,
                cartId,
                reference,
                email,
                amountKobo,
                "flutterwave",
                nowIso,
                nowIso,
            )
            .run();

        await db
            .prepare(
                `UPDATE carts
                 SET email = ?, updated_at = ?
                 WHERE id = ?`,
            )
            .bind(email, nowIso, cartId)
            .run();

        const initialization = await initializeProviderPayment({
            secretKey: providerSecretKey,
            email,
            amountKobo,
            reference,
            callbackUrl,
            orderId,
            cartId,
            phone,
        });

        if (!initialization.ok) {
            await db
                .prepare(
                    `UPDATE orders
                     SET status = 'failed',
                         provider_raw_json = ?,
                         updated_at = ?
                     WHERE id = ?`,
                )
                .bind(
                    JSON.stringify(initialization.raw ?? {}),
                    new Date().toISOString(),
                    orderId,
                )
                .run();

            return jsonResponse(
                {
                    error: initialization.error || "Unable to initialize transaction",
                },
                502,
            );
        }

        return jsonResponse({
            authorization_url: initialization.authorizationUrl,
            reference,
            provider: "flutterwave",
        });
    } catch (error: any) {
        console.error("[checkout/initialize] Unexpected error", error);
        return jsonResponse(
            { error: error?.message || "Checkout initialization failed" },
            500,
        );
    }
};
