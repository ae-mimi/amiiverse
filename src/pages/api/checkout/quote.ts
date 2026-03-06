import type { APIRoute } from "astro";
import { getCloudflareRuntimeEnv } from "../../../lib/server/cloudflareRuntimeEnv";
import { buildQuote, normalizeCountry, normalizeCurrency, normalizeRegion } from "../../../lib/server/ecom";
import { quoteRequestSchema } from "../../../lib/server/ecomValidation";
import { createId } from "../../../lib/server/cart";

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
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

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;
        if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

        const body = await request.json().catch(() => ({}));
        const parsed = quoteRequestSchema.safeParse(body);
        if (!parsed.success) {
            return jsonResponse(
                { error: "Invalid payload", details: parsed.error.flatten() },
                400,
            );
        }

        const input = {
            cartId: parsed.data.cartId,
            currency: normalizeCurrency(parsed.data.currency),
            country: normalizeCountry(parsed.data.country),
            region: normalizeRegion(parsed.data.region),
        };

        const quote = await buildQuote(db, input);
        const quoteId = createId("quote");
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
                input.cartId,
                quote.quote_hash,
                quote.subtotal.amount_minor,
                quote.shipping.amount_minor,
                quote.tax.amount_minor,
                quote.total.amount_minor,
                quote.total.currency,
                quote.fx_rate,
                quote.expires_at,
                new Date().toISOString(),
            )
            .run();

        return jsonResponse({
            quoteId,
            quoteHash: quote.quote_hash,
            subtotal: quote.subtotal,
            shipping: quote.shipping,
            tax: quote.tax,
            total: quote.total,
            fx: {
                base: "NGN",
                quote: quote.total.currency,
                rate: quote.fx_rate,
            },
            expiresAt: quote.expires_at,
        });
    } catch (error: any) {
        console.error("[checkout/quote] failed", error);
        return jsonResponse({ error: error?.message || "Failed to create quote" }, 500);
    }
};
