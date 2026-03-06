import type { APIRoute } from "astro";
import {
    getCloudflareRuntimeEnv,
    getServerEnvValue,
} from "../../../lib/server/cloudflareRuntimeEnv";

export const prerender = false;

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    first: () => Promise<Record<string, unknown> | null>;
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

export const GET: APIRoute = async ({ request, locals }) => {
    const adminToken = getServerEnvValue({ locals }, "ADMIN_SYNC_TOKEN");
    const providedToken = request.headers.get("x-admin-token") ?? "";
    if (!adminToken || providedToken !== adminToken) {
        return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const runtimeEnv = getCloudflareRuntimeEnv({ locals });
    const db = runtimeEnv.DB as D1DatabaseLike | undefined;
    if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

    const products = await db
        .prepare(
            `SELECT
                COUNT(*) AS product_count,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_count,
                MAX(updated_at) AS last_updated
             FROM products`,
        )
        .first();
    const variants = await db
        .prepare(
            `SELECT
                COUNT(*) AS variant_count
             FROM product_variants`,
        )
        .first();
    const orders = await db
        .prepare(
            `SELECT
                SUM(CASE WHEN status = 'pending_payment' THEN 1 ELSE 0 END) AS pending_payment,
                SUM(CASE WHEN status = 'fulfillment_pending' THEN 1 ELSE 0 END) AS fulfillment_pending,
                SUM(CASE WHEN status = 'refund_pending' THEN 1 ELSE 0 END) AS refund_pending
             FROM orders`,
        )
        .first();

    return jsonResponse({
        ok: true,
        product_count: Number(products?.product_count ?? 0),
        active_products: Number(products?.active_count ?? 0),
        variant_count: Number(variants?.variant_count ?? 0),
        products_last_updated_at: String(products?.last_updated ?? ""),
        queues: {
            pending_payment: Number(orders?.pending_payment ?? 0),
            fulfillment_pending: Number(orders?.fulfillment_pending ?? 0),
            refund_pending: Number(orders?.refund_pending ?? 0),
        },
    });
};
