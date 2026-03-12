import type { APIRoute } from "astro";
import {
    getCloudflareRuntimeEnv,
    getServerEnvValue,
} from "../../../lib/server/cloudflareRuntimeEnv";
import { releaseOrderReservations } from "../../../lib/server/inventory";

export const prerender = false;

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    all: () => Promise<{ results?: Array<Record<string, unknown>> }>;
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

export const POST: APIRoute = async ({ request, locals, url }) => {
    const adminToken = getServerEnvValue({ locals }, "ADMIN_SYNC_TOKEN");
    const headerToken = request.headers.get("x-admin-token") ?? "";
    const queryToken = String(url.searchParams.get("token") || "").trim();
    if (!adminToken || (headerToken !== adminToken && queryToken !== adminToken)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const runtimeEnv = getCloudflareRuntimeEnv({ locals });
    const db = runtimeEnv.DB as D1DatabaseLike | undefined;
    if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

    const body = await request.json().catch(() => ({}));
    const ttlMinutes = Math.max(5, Math.min(240, Number(body?.ttlMinutes || 20)));
    const limit = Math.max(1, Math.min(500, Number(body?.limit || 200)));
    const nowIso = new Date().toISOString();

    const pending = await db
        .prepare(
            `SELECT id, cart_id, reference
             FROM orders
             WHERE status = 'pending_payment'
               AND datetime(created_at) <= datetime('now', ?)
             ORDER BY datetime(created_at) ASC
             LIMIT ?`,
        )
        .bind(`-${ttlMinutes} minutes`, limit)
        .all();

    let orderCount = 0;
    let releasedUnits = 0;
    for (const row of pending.results ?? []) {
        const orderId = String(row.id || "").trim();
        const cartId = String(row.cart_id || "").trim();
        const reference = String(row.reference || "").trim();
        if (!orderId) continue;

        releasedUnits += await releaseOrderReservations(db, orderId, nowIso);

        await db
            .prepare(
                `UPDATE orders
                 SET status = 'failed',
                     provider_raw_json = COALESCE(provider_raw_json, ?),
                     updated_at = ?
                 WHERE id = ?`,
            )
            .bind(
                JSON.stringify({
                    code: "expired_pending_payment",
                    message: "Reservation expired before payment confirmation",
                    reference,
                }),
                nowIso,
                orderId,
            )
            .run();

        await db
            .prepare(
                `UPDATE payments
                 SET status = 'expired', updated_at = ?
                 WHERE order_id = ?`,
            )
            .bind(nowIso, orderId)
            .run();

        if (cartId) {
            await db
                .prepare(
                    `UPDATE carts
                     SET status = CASE
                         WHEN status = 'open' THEN 'abandoned'
                         ELSE status
                     END,
                         updated_at = ?
                     WHERE id = ?`,
                )
                .bind(nowIso, cartId)
                .run();
        }

        orderCount += 1;
    }

    return jsonResponse({
        ok: true,
        ttlMinutes,
        scanned: Number(pending.results?.length || 0),
        releasedOrders: orderCount,
        releasedUnits,
    });
};
