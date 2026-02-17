import type { APIRoute } from "astro";
import { getCartDto, getD1FromContext, jsonResponse } from "../../../lib/server/cart";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
    try {
        const db = getD1FromContext({ locals });
        if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

        const cartId = String(url.searchParams.get("cartId") || "").trim();
        if (!cartId) return jsonResponse({ error: "Missing cartId" }, 400);

        const cart = await getCartDto(db, cartId);
        if (!cart) return jsonResponse({ error: "Cart not found" }, 404);

        return jsonResponse({ cart });
    } catch (error: any) {
        console.error("[cart/get] failed", error);
        return jsonResponse(
            { error: error?.message || "Failed to fetch cart" },
            500,
        );
    }
};
