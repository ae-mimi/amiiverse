import type { APIRoute } from "astro";
import {
    createId,
    getCartDto,
    getD1FromContext,
    jsonResponse,
} from "../../../lib/server/cart";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
    try {
        const db = getD1FromContext({ locals });
        if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

        const cartId = createId("cart");
        const nowIso = new Date().toISOString();

        await db
            .prepare(
                `INSERT INTO carts (id, email, status, created_at, updated_at)
                 VALUES (?, NULL, 'open', ?, ?)`,
            )
            .bind(cartId, nowIso, nowIso)
            .run();

        const cart = await getCartDto(db, cartId);
        return jsonResponse({ cart });
    } catch (error: any) {
        console.error("[cart/create] failed", error);
        return jsonResponse(
            { error: error?.message || "Failed to create cart" },
            500,
        );
    }
};
