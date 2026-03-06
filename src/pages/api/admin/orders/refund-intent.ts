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
    if (!canTransitionOrderStatus(from, "refund_pending")) {
        return jsonResponse(
            { error: `Cannot request refund from status ${from}` },
            409,
        );
    }

    await db
        .prepare(
            `UPDATE orders
             SET status = 'refund_pending', updated_at = ?
             WHERE id = ?`,
        )
        .bind(new Date().toISOString(), String(order.id))
        .run();

    return jsonResponse({ ok: true, reference, status: "refund_pending" });
};
