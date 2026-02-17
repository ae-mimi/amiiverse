import type { APIRoute } from "astro";
import { getCartDto, getD1FromContext, jsonResponse } from "../../../lib/server/cart";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const db = getD1FromContext({ locals });
        if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

        const body = await request.json().catch(() => ({}));
        const cartId = String(body?.cartId || "").trim();
        const itemId = String(body?.itemId || "").trim();

        if (!cartId || !itemId) {
            return jsonResponse({ error: "cartId and itemId are required" }, 400);
        }

        const cart = await db
            .prepare(`SELECT id, status FROM carts WHERE id = ? LIMIT 1`)
            .bind(cartId)
            .first();
        if (!cart) return jsonResponse({ error: "Cart not found" }, 404);
        if (String(cart.status) !== "open") {
            return jsonResponse({ error: "Cart is not open" }, 409);
        }

        await db
            .prepare(`DELETE FROM cart_items WHERE id = ? AND cart_id = ?`)
            .bind(itemId, cartId)
            .run();

        await db
            .prepare(`UPDATE carts SET updated_at = ? WHERE id = ?`)
            .bind(new Date().toISOString(), cartId)
            .run();

        const refreshed = await getCartDto(db, cartId);
        return jsonResponse({ cart: refreshed });
    } catch (error: any) {
        console.error("[cart/remove] failed", error);
        return jsonResponse(
            { error: error?.message || "Failed to remove item" },
            500,
        );
    }
};
