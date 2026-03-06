import type { APIRoute } from "astro";
import { getCloudflareRuntimeEnv } from "../../../lib/server/cloudflareRuntimeEnv";
import { createId } from "../../../lib/server/cart";
import {
    buildQuote,
    getCartLines,
    getVariantAvailability,
    normalizeCountry,
    normalizeCurrency,
    normalizeRegion,
} from "../../../lib/server/ecom";
import { checkoutInitSchema } from "../../../lib/server/ecomValidation";
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

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function normalizeIdempotencyKey(value: string | null): string {
    return String(value || "")
        .trim()
        .slice(0, 180);
}

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const idempotencyKey = normalizeIdempotencyKey(
            request.headers.get("Idempotency-Key"),
        );
        if (!idempotencyKey) {
            return jsonResponse(
                { error: "Missing Idempotency-Key header" },
                400,
            );
        }

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
        const parsed = checkoutInitSchema.safeParse(body);
        if (!parsed.success) {
            return jsonResponse(
                { error: "Invalid payload", details: parsed.error.flatten() },
                400,
            );
        }

        const cartId = parsed.data.cartId;
        const email = parsed.data.email.toLowerCase();
        const phone = String(parsed.data.phone || "").trim();
        const currency = normalizeCurrency(parsed.data.currency);
        const country = normalizeCountry(parsed.data.country);
        const region = normalizeRegion(parsed.data.region);
        const quoteHash = parsed.data.quoteHash;

        const existingByIdempotency = await db
            .prepare(
                `SELECT reference
                 FROM orders
                 WHERE cart_id = ? AND idempotency_key = ?
                 LIMIT 1`,
            )
            .bind(cartId, idempotencyKey)
            .first();
        if (existingByIdempotency?.reference) {
            return jsonResponse({
                status: "replayed",
                reference: String(existingByIdempotency.reference),
            });
        }

        const cartRow = await db
            .prepare(
                `SELECT id, status
                 FROM carts
                 WHERE id = ?
                 LIMIT 1`,
            )
            .bind(cartId)
            .first();
        if (!cartRow) return jsonResponse({ error: "Cart not found" }, 404);
        if (String(cartRow.status || "") !== "open") {
            return jsonResponse({ error: "Cart is not open" }, 409);
        }

        const quote = await buildQuote(db, { cartId, currency, country, region });
        if (quote.quote_hash !== quoteHash) {
            return jsonResponse(
                {
                    error: "Quote mismatch. Please refresh totals.",
                    expectedQuoteHash: quote.quote_hash,
                },
                409,
            );
        }

        const lines = await getCartLines(db, cartId);
        if (!lines.length) {
            return jsonResponse({ error: "Cart has no items" }, 400);
        }

        for (const line of lines) {
            const available = await getVariantAvailability(db, line.variant_id);
            if (available < line.quantity) {
                return jsonResponse(
                    {
                        error: "Insufficient stock for one or more variants",
                        variantId: line.variant_id,
                        available,
                    },
                    409,
                );
            }
        }

        const nowIso = new Date().toISOString();
        const reference = `amii_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const orderId = createId("ord");
        const quoteId = createId("quote");
        const callbackUrl = `${new URL(request.url).origin}/shop/success?reference=${encodeURIComponent(reference)}`;

        await db
            .prepare(
                `INSERT INTO quotes (
                    id,
                    cart_id,
                    quote_hash,
                    subtotal_minor,
                    shipping_minor,
                    tax_minor,
                    total_minor,
                    currency,
                    fx_rate,
                    expires_at,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
                quoteId,
                cartId,
                quote.quote_hash,
                quote.subtotal.amount_minor,
                quote.shipping.amount_minor,
                quote.tax.amount_minor,
                quote.total.amount_minor,
                quote.total.currency,
                quote.fx_rate,
                quote.expires_at,
                nowIso,
            )
            .run();

        await db
            .prepare(
                `INSERT INTO orders (
                    id,
                    cart_id,
                    quote_id,
                    reference,
                    idempotency_key,
                    email,
                    amount_kobo,
                    currency_code,
                    subtotal_minor,
                    shipping_minor,
                    tax_minor,
                    total_minor,
                    payment_provider,
                    status,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'flutterwave', 'pending_payment', ?, ?)`,
            )
            .bind(
                orderId,
                cartId,
                quoteId,
                reference,
                idempotencyKey,
                email,
                quote.total.amount_minor,
                quote.total.currency,
                quote.subtotal.amount_minor,
                quote.shipping.amount_minor,
                quote.tax.amount_minor,
                quote.total.amount_minor,
                nowIso,
                nowIso,
            )
            .run();

        for (const line of lines) {
            const lineTotal = line.base_price_minor_ngn * line.quantity;
            await db
                .prepare(
                    `INSERT INTO order_items (
                        id,
                        order_id,
                        variant_id,
                        product_id,
                        sku,
                        title_snapshot,
                        cover_image_snapshot,
                        unit_price_minor,
                        quantity,
                        total_minor,
                        currency,
                        metadata_json,
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                )
                .bind(
                    createId("oit"),
                    orderId,
                    line.variant_id,
                    line.product_id,
                    line.sku || null,
                    line.title,
                    line.image || null,
                    line.base_price_minor_ngn,
                    line.quantity,
                    lineTotal,
                    "NGN",
                    JSON.stringify({ productType: line.product_type }),
                    nowIso,
                )
                .run();

            await db
                .prepare(
                    `UPDATE inventory
                     SET reserved = reserved + ?, updated_at = ?
                     WHERE variant_id = ?`,
                )
                .bind(line.quantity, nowIso, line.variant_id)
                .run();
        }

        await db
            .prepare(
                `INSERT INTO payments (
                    id,
                    order_id,
                    provider,
                    reference,
                    status,
                    created_at,
                    updated_at
                ) VALUES (?, ?, 'flutterwave', ?, 'pending', ?, ?)`,
            )
            .bind(createId("pay"), orderId, reference, nowIso, nowIso)
            .run();

        await db
            .prepare(
                `UPDATE carts
                 SET email = ?, currency = ?, country = ?, region = ?, updated_at = ?
                 WHERE id = ?`,
            )
            .bind(email, currency, country, region, nowIso, cartId)
            .run();

        const initialization = await initializeProviderPayment({
            secretKey: providerSecretKey,
            email,
            amountMinor: quote.total.amount_minor,
            currency: quote.total.currency,
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

        await db
            .prepare(
                `UPDATE payments
                 SET status = 'initialized',
                     raw_json = ?,
                     updated_at = ?
                 WHERE order_id = ?`,
            )
            .bind(JSON.stringify(initialization.raw ?? {}), nowIso, orderId)
            .run();

        return jsonResponse({
            authorization_url: initialization.authorizationUrl,
            reference,
            provider: "flutterwave",
            quoteHash: quote.quote_hash,
            totals: {
                subtotal: quote.subtotal,
                shipping: quote.shipping,
                tax: quote.tax,
                total: quote.total,
            },
        });
    } catch (error: any) {
        console.error("[checkout/initialize] Unexpected error", error);
        return jsonResponse(
            { error: error?.message || "Checkout initialization failed" },
            500,
        );
    }
};
