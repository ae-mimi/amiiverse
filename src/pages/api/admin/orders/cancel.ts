import type { APIRoute } from "astro";
import {
    getCloudflareRuntimeEnv,
    getServerEnvValue,
} from "../../../../lib/server/cloudflareRuntimeEnv";
import { canTransitionOrderStatus } from "../../../../lib/server/ecom";

export const prerender = false;

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    first: () => Promise<Record<string, unknown> | null>;
    all: () => Promise<{ results?: Array<Record<string, unknown>> }>;
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

export const POST: APIRoute = async ({ request, locals }) => {
    const adminToken = getServerEnvValue({ locals }, "ADMIN_SYNC_TOKEN");
    const providedToken = request.headers.get("x-admin-token") ?? "";
    if (!adminToken || providedToken !== adminToken) {
        return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const runtimeEnv = getCloudflareRuntimeEnv({ locals });
    const db = runtimeEnv.DB as D1DatabaseLike | undefined;
    if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

    const body = await request.json().catch(() => ({}));
    const reference = String(body?.reference || "").trim();
    if (!reference) return jsonResponse({ error: "Missing reference" }, 400);

    const order = await db
        .prepare(`SELECT id, status FROM orders WHERE reference = ? LIMIT 1`)
        .bind(reference)
        .first();
    if (!order) return jsonResponse({ error: "Order not found" }, 404);

    const from = String(order.status || "");
    if (!canTransitionOrderStatus(from, "cancelled")) {
        return jsonResponse({ error: `Cannot cancel from status ${from}` }, 409);
    }

    const nowIso = new Date().toISOString();
    await db
        .prepare(
            `UPDATE orders
             SET status = 'cancelled', updated_at = ?
             WHERE id = ?`,
        )
        .bind(nowIso, String(order.id))
        .run();

    const items = await db
        .prepare(
            `SELECT variant_id, quantity
             FROM order_items
             WHERE order_id = ?`,
        )
        .bind(String(order.id))
        .all();
    for (const item of items.results ?? []) {
        const variantId = String(item.variant_id || "");
        const qty = Math.max(0, Number(item.quantity ?? 0));
        if (!variantId || qty <= 0) continue;
        await db
            .prepare(
                `UPDATE inventory
                 SET reserved = CASE WHEN reserved >= ? THEN reserved - ? ELSE 0 END,
                     updated_at = ?
                 WHERE variant_id = ?`,
            )
            .bind(qty, qty, nowIso, variantId)
            .run();
    }

    return jsonResponse({ ok: true, reference, status: "cancelled" });
};
