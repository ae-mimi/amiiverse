import type { APIRoute } from "astro";
import {
    createId,
    type D1DatabaseLike,
    getCartDto,
    getD1FromContext,
    jsonResponse,
} from "../../../lib/server/cart";
import {
    getVariantAvailability,
    normalizeCountry,
    normalizeCurrency,
    normalizeRegion,
} from "../../../lib/server/ecom";
import { addToCartSchema } from "../../../lib/server/ecomValidation";

export const prerender = false;

function normalizeQuantity(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return 1;
    return Math.max(1, Math.floor(parsed));
}

async function findDefaultVariantIdByProductId(
    db: D1DatabaseLike,
    productId: string,
): Promise<string> {
    const fallback = `${productId}_default`;
    const row = await db
        .prepare(
            `SELECT id
             FROM product_variants
             WHERE id = ? OR product_id = ?
             ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END
             LIMIT 1`,
        )
        .bind(fallback, productId, fallback)
        .first();
    return String(row?.id || fallback);
}

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = getD1FromContext({ locals });
        if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

        const body = await request.json().catch(() => ({}));
        const parsed = addToCartSchema.safeParse({
            ...body,
            quantity: normalizeQuantity(body?.quantity),
        });
        if (!parsed.success) {
            return jsonResponse(
                { error: "Invalid payload", details: parsed.error.flatten() },
                400,
            );
        }

        const cartId = parsed.data.cartId;
        const quantity = normalizeQuantity(parsed.data.quantity);
        const currency = normalizeCurrency(parsed.data.currency);
        const country = normalizeCountry(parsed.data.country);
        const region = normalizeRegion(parsed.data.region);
        let variantId = String(parsed.data.variantId || "").trim();
        const productId = String(parsed.data.productId || "").trim();

        if (!variantId && productId) {
            variantId = await findDefaultVariantIdByProductId(db, productId);
        }
        if (!variantId) {
            return jsonResponse(
                { error: "variantId (or productId) is required" },
                400,
            );
        }

        const cart = await db
            .prepare(`SELECT id, status FROM carts WHERE id = ? LIMIT 1`)
            .bind(cartId)
            .first();
        if (!cart) return jsonResponse({ error: "Cart not found" }, 404);
        if (String(cart.status) !== "open") {
            return jsonResponse({ error: "Cart is not open" }, 409);
        }

        const variant = await db
            .prepare(
                `SELECT
                    pv.id,
                    pv.product_id,
                    pv.sku,
                    pv.title AS variant_title,
                    pv.base_price_minor_ngn,
                    pv.is_active AS variant_active,
                    p.title AS product_title,
                    p.product_type,
                    p.cover_image_url,
                    p.is_active AS product_active
                 FROM product_variants pv
                 INNER JOIN products p ON p.id = pv.product_id
                 WHERE pv.id = ?
                 LIMIT 1`,
            )
            .bind(variantId)
            .first();
        if (
            !variant ||
            Number(variant.variant_active ?? 0) !== 1 ||
            Number(variant.product_active ?? 0) !== 1
        ) {
            return jsonResponse({ error: "Variant not found or inactive" }, 404);
        }

        const available = await getVariantAvailability(db, variantId);
        const existingItem = await db
            .prepare(
                `SELECT id, quantity
                 FROM cart_items
                 WHERE cart_id = ? AND variant_id = ?
                 LIMIT 1`,
            )
            .bind(cartId, variantId)
            .first();

        const nextQuantity = existingItem?.id
            ? Math.max(1, Number(existingItem.quantity || 0) + quantity)
            : quantity;
        if (available < nextQuantity) {
            return jsonResponse(
                {
                    error: "Variant is out of stock for requested quantity",
                    available,
                },
                409,
            );
        }

        const nowIso = new Date().toISOString();
        if (existingItem?.id) {
            await db
                .prepare(
                    `UPDATE cart_items
                     SET quantity = ?
                     WHERE id = ?`,
                )
                .bind(nextQuantity, String(existingItem.id))
                .run();
        } else {
            const lineItemId = createId("item");
            await db
                .prepare(
                    `INSERT INTO cart_items (
                        id,
                        cart_id,
                        product_id,
                        variant_id,
                        sku_snapshot,
                        quantity,
                        currency_code,
                        unit_price_ngn,
                        title_snapshot,
                        product_type_snapshot,
                        cover_image_snapshot
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                )
                .bind(
                    lineItemId,
                    cartId,
                    String(variant.product_id || ""),
                    variantId,
                    String(variant.sku || ""),
                    quantity,
                    currency,
                    Math.max(0, Number(variant.base_price_minor_ngn || 0)),
                    String(
                        variant.variant_title ||
                            variant.product_title ||
                            "Product Variant",
                    ),
                    String(variant.product_type || "physical"),
                    String(variant.cover_image_url || ""),
                )
                .run();
        }

        await db
            .prepare(
                `UPDATE carts
                 SET currency = ?, country = ?, region = ?, updated_at = ?
                 WHERE id = ?`,
            )
            .bind(currency, country, region, nowIso, cartId)
            .run();

        const refreshed = await getCartDto(db, cartId);
        return jsonResponse({ cart: refreshed });
    } catch (error: any) {
        console.error("[cart/add] failed", error);
        return jsonResponse({ error: error?.message || "Failed to add item" }, 500);
    }
};
