import type { APIRoute } from "astro";
import { getCloudflareRuntimeEnv } from "../../../lib/server/cloudflareRuntimeEnv";
import {
    getFxRate,
    normalizeCountry,
    normalizeCurrency,
    normalizeRegion,
} from "../../../lib/server/ecom";

export const prerender = false;

type SortMode = "newest" | "price_asc" | "price_desc";

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    all: () => Promise<{ results?: Array<Record<string, unknown>> }>;
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

function normalizeSort(value: string | null): SortMode {
    if (value === "price_asc" || value === "price-asc") return "price_asc";
    if (value === "price_desc" || value === "price-desc") return "price_desc";
    return "newest";
}

function normalizeQuery(value: string | null): string {
    return (value ?? "").trim().slice(0, 120);
}

function buildOrderBy(sort: SortMode): string {
    if (sort === "price_asc") return "pv.base_price_minor_ngn ASC, p.updated_at DESC";
    if (sort === "price_desc") return "pv.base_price_minor_ngn DESC, p.updated_at DESC";
    return "p.updated_at DESC";
}

export const GET: APIRoute = async ({ url, locals }) => {
    try {
        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;
        if (!db) {
            return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);
        }

        const query = normalizeQuery(url.searchParams.get("query"));
        const sort = normalizeSort(url.searchParams.get("sort"));
        const type = String(url.searchParams.get("type") || "").trim().toLowerCase();
        const currency = normalizeCurrency(url.searchParams.get("currency"));
        const country = normalizeCountry(url.searchParams.get("country"));
        const region = normalizeRegion(url.searchParams.get("region"));
        const fxRate = await getFxRate(db, currency);

        const where: string[] = ["p.is_active = 1", "pv.is_active = 1"];
        const params: unknown[] = [];

        if (type === "physical" || type === "digital") {
            where.push("p.product_type = ?");
            params.push(type);
        }
        if (query) {
            where.push("(p.title LIKE ? OR p.description LIKE ?)");
            params.push(`%${query}%`, `%${query}%`);
        }

        const sql = `
            SELECT
                p.id,
                p.slug,
                p.title,
                p.product_type,
                p.cover_image_url,
                p.is_active,
                p.updated_at,
                pv.id AS variant_id,
                pv.title AS variant_title,
                pv.sku,
                pv.base_price_minor_ngn,
                COALESCE(i.on_hand, 0) AS on_hand,
                COALESCE(i.reserved, 0) AS reserved,
                COALESCE(i.safety_stock, 0) AS safety_stock
            FROM products p
            LEFT JOIN product_variants pv
                ON pv.product_id = p.id
            LEFT JOIN inventory i
                ON i.variant_id = pv.id
            WHERE ${where.join(" AND ")}
            ORDER BY ${buildOrderBy(sort)}
            LIMIT 120
        `;
        const result = await db.prepare(sql).bind(...params).all();
        const rows = result.results ?? [];

        return jsonResponse({
            products: rows.map((row) => {
                const baseMinorNgn = Math.max(0, Number(row.base_price_minor_ngn ?? 0));
                const priceMinor = Math.round(baseMinorNgn * fxRate);
                const available =
                    Math.max(0, Number(row.on_hand || 0) - Number(row.reserved || 0) - Number(row.safety_stock || 0));
                return {
                    id: String(row.variant_id ?? row.id ?? ""),
                    product_id: String(row.id ?? ""),
                    variant_id: String(row.variant_id ?? ""),
                    slug: String(row.slug ?? ""),
                    title: String(row.title ?? ""),
                    variant_title: String(row.variant_title ?? ""),
                    sku: String(row.sku ?? ""),
                    product_type:
                        String(row.product_type || "physical") === "digital"
                            ? "digital"
                            : "physical",
                    cover_image_url: String(row.cover_image_url ?? ""),
                    is_active: Number(row.is_active ?? 0),
                    updated_at: String(row.updated_at ?? ""),
                    price_ngn: baseMinorNgn,
                    price_minor: priceMinor,
                    currency,
                    stock: {
                        available,
                        is_in_stock: available > 0,
                    },
                };
            }),
            meta: {
                query,
                sort,
                currency,
                country,
                region,
                fx_rate: fxRate,
            },
        });
    } catch (error: any) {
        console.error("[shop/products] failed", error);
        return jsonResponse(
            { error: error?.message || "Failed to load shop products" },
            500,
        );
    }
};
