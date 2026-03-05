import type { APIRoute } from "astro";
import { getCloudflareRuntimeEnv } from "../../lib/server/cloudflareRuntimeEnv";

export const prerender = false;

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    first: () => Promise<Record<string, unknown> | null>;
}

interface D1DatabaseLike {
    prepare: (query: string) => D1PreparedStatementLike;
}

interface KVNamespaceLike {
    get: (key: string) => Promise<string | null>;
    put: (
        key: string,
        value: string,
        options?: { expirationTtl?: number },
    ) => Promise<void>;
}

interface R2ObjectLike {
    body: ReadableStream<Uint8Array> | null;
    size?: number;
    etag?: string;
    httpMetadata?: {
        contentType?: string;
        contentLanguage?: string;
        contentDisposition?: string;
        contentEncoding?: string;
        cacheControl?: string;
    };
}

interface R2BucketLike {
    get: (key: string) => Promise<R2ObjectLike | null>;
}

function buildDownloadName(productTitle: string, r2Key: string): string {
    const baseName = r2Key.split("/").pop() || "download.bin";
    const safeTitle = (productTitle || "amii-product")
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 64);
    const ext = baseName.includes(".") ? baseName.slice(baseName.lastIndexOf(".")) : "";
    return `${safeTitle || "amii-product"}${ext || ""}`;
}

export const GET: APIRoute = async ({ url, locals }) => {
    try {
        const reference = String(url.searchParams.get("reference") || "").trim();
        const productId = String(url.searchParams.get("productId") || "").trim();

        if (!reference || !productId) {
            return new Response("Missing reference or productId", { status: 400 });
        }

        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;
        const bucket = runtimeEnv.ASSETS_BUCKET as R2BucketLike | undefined;
        const cache = runtimeEnv.CACHE as KVNamespaceLike | undefined;

        if (!db) return new Response("Missing D1 binding `DB`", { status: 500 });
        if (!bucket) {
            return new Response("Missing R2 binding `ASSETS_BUCKET`", {
                status: 500,
            });
        }

        const rateLimitKey = `dl:${reference}`;
        const rateLimitWindowSeconds = 60 * 60;
        const rateLimitMaxPerWindow = 12;

        if (cache) {
            const currentRaw = await cache.get(rateLimitKey);
            const current = Number(currentRaw || 0);
            if (Number.isFinite(current) && current >= rateLimitMaxPerWindow) {
                return new Response("Rate limit exceeded. Try again later.", {
                    status: 429,
                });
            }
            await cache.put(rateLimitKey, String(Math.max(0, current) + 1), {
                expirationTtl: rateLimitWindowSeconds,
            });
        }

        const row = await db
            .prepare(
                `SELECT
                    o.status AS order_status,
                    o.reference,
                    o.cart_id,
                    p.id AS product_id,
                    p.title AS product_title,
                    p.product_type,
                    p.r2_key
                 FROM orders o
                 INNER JOIN cart_items ci ON ci.cart_id = o.cart_id
                 INNER JOIN products_cache p ON p.id = ci.product_id
                 WHERE o.reference = ? AND p.id = ?
                 LIMIT 1`,
            )
            .bind(reference, productId)
            .first();

        if (!row) {
            return new Response("Order/product mapping not found", { status: 404 });
        }

        if (String(row.order_status || "") !== "paid") {
            return new Response("Order not paid", { status: 403 });
        }

        if (String(row.product_type || "") !== "digital") {
            return new Response("Product is not downloadable", { status: 400 });
        }

        const r2Key = String(row.r2_key || "").trim();
        if (!r2Key) {
            return new Response("Digital file is not configured", { status: 404 });
        }

        const object = await bucket.get(r2Key);
        if (!object?.body) {
            return new Response("File not found", { status: 404 });
        }

        const filename = buildDownloadName(String(row.product_title || ""), r2Key);
        const headers = new Headers();
        headers.set(
            "Content-Type",
            object.httpMetadata?.contentType || "application/octet-stream",
        );
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        headers.set("Cache-Control", "private, max-age=0, no-store");
        if (object.size) headers.set("Content-Length", String(object.size));
        if (object.etag) headers.set("ETag", object.etag);

        return new Response(object.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("[download] failed", error);
        return new Response("Download failed", { status: 500 });
    }
};
