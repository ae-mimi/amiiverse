import type { APIRoute } from "astro";
import {
    createId,
    getCartDto,
    getD1FromContext,
    jsonResponse,
} from "../../../lib/server/cart";

export const prerender = false;

function normalizeQuantity(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return 1;
    return Math.max(1, Math.floor(parsed));
}

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = getD1FromContext({ locals });
        if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

        const body = await request.json().catch(() => ({}));
        const cartId = String(body?.cartId || "").trim();
        const productId = String(body?.productId || "").trim();
        const quantity = normalizeQuantity(body?.quantity);

        if (!cartId || !productId) {
            return jsonResponse({ error: "cartId and productId are required" }, 400);
        }

        const cart = await db
            .prepare(`SELECT id, status FROM carts WHERE id = ? LIMIT 1`)
            .bind(cartId)
            .first();
        if (!cart) return jsonResponse({ error: "Cart not found" }, 404);
        if (String(cart.status) !== "open") {
            return jsonResponse({ error: "Cart is not open" }, 409);
        }

        const product = await db
            .prepare(
                `SELECT id, title, price_ngn, product_type, cover_image_url, is_active
                 FROM products_cache
                 WHERE id = ? LIMIT 1`,
            )
            .bind(productId)
            .first();
        if (!product || Number(product.is_active ?? 0) !== 1) {
            return jsonResponse({ error: "Product not found or inactive" }, 404);
        }

        const existingItem = await db
            .prepare(
                `SELECT id, quantity
                 FROM cart_items
                 WHERE cart_id = ? AND product_id = ?
                 LIMIT 1`,
            )
            .bind(cartId, productId)
            .first();

        const nowIso = new Date().toISOString();
        if (existingItem?.id) {
            const nextQuantity = Math.max(
                1,
                Number(existingItem.quantity || 0) + quantity,
            );
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
                        quantity,
                        unit_price_ngn,
                        title_snapshot,
                        product_type_snapshot,
                        cover_image_snapshot
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                )
                .bind(
                    lineItemId,
                    cartId,
                    productId,
                    quantity,
                    Math.max(0, Number(product.price_ngn || 0)),
                    String(product.title || "Product"),
                    String(product.product_type || "physical"),
                    String(product.cover_image_url || ""),
                )
                .run();
        }

        await db
            .prepare(
                `UPDATE carts
                 SET updated_at = ?
                 WHERE id = ?`,
            )
            .bind(nowIso, cartId)
            .run();

        const refreshed = await getCartDto(db, cartId);
        return jsonResponse({ cart: refreshed });
    } catch (error: any) {
        console.error("[cart/add] failed", error);
        return jsonResponse({ error: error?.message || "Failed to add item" }, 500);
    }
};
