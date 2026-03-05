import type { APIRoute } from "astro";
import { getCloudflareRuntimeEnv } from "../../../lib/server/cloudflareRuntimeEnv";

export const prerender = false;

type SortMode = "newest" | "price_asc" | "price_desc";
type ProductType = "physical" | "digital";

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    all: () => Promise<{ results?: Array<Record<string, unknown>> }>;
}

interface D1DatabaseLike {
    prepare: (query: string) => D1PreparedStatementLike;
}

interface ShopProductRow {
    id: string;
    slug: string;
    title: string;
    price_ngn: number;
    product_type: ProductType;
    cover_image_url: string;
    is_active: number;
    updated_at?: string;
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

function normalizeType(value: string | null): ProductType | null {
    if (value === "physical" || value === "digital") return value;
    return null;
}

function normalizeQuery(value: string | null): string {
    return (value ?? "").trim().slice(0, 120);
}

function buildOrderBy(sort: SortMode): string {
    if (sort === "price_asc") return "p.price_ngn ASC, p.updated_at DESC";
    if (sort === "price_desc") return "p.price_ngn DESC, p.updated_at DESC";
    return "p.updated_at DESC";
}

export const GET: APIRoute = async ({ url, locals }) => {
    try {
        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;
        if (!db) {
            return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);
        }

        const type = normalizeType(url.searchParams.get("type"));
        const query = normalizeQuery(url.searchParams.get("query"));
        const sort = normalizeSort(url.searchParams.get("sort"));
        const orderBy = buildOrderBy(sort);

        const where: string[] = ["p.is_active = 1"];
        const params: unknown[] = [];

        if (type) {
            where.push("p.product_type = ?");
            params.push(type);
        }

        let sql = "";
        if (query) {
            const ftsQuery = `${query}*`;
            sql = `
                SELECT
                    p.id,
                    p.slug,
                    p.title,
                    p.price_ngn,
                    p.product_type,
                    p.cover_image_url,
                    p.is_active,
                    p.updated_at
                FROM products_cache p
                INNER JOIN products_fts f ON f.rowid = p.rowid
                WHERE ${where.join(" AND ")} AND f.products_fts MATCH ?
                ORDER BY ${orderBy}
                LIMIT 120
            `;
            params.push(ftsQuery);
        } else {
            sql = `
                SELECT
                    p.id,
                    p.slug,
                    p.title,
                    p.price_ngn,
                    p.product_type,
                    p.cover_image_url,
                    p.is_active,
                    p.updated_at
                FROM products_cache p
                WHERE ${where.join(" AND ")}
                ORDER BY ${orderBy}
                LIMIT 120
            `;
        }

        const result = await db.prepare(sql).bind(...params).all();
        const rows = (result.results ?? []) as ShopProductRow[];

        return jsonResponse({
            products: rows.map((row) => ({
                id: String(row.id ?? ""),
                slug: String(row.slug ?? ""),
                title: String(row.title ?? ""),
                price_ngn: Number(row.price_ngn ?? 0),
                product_type:
                    row.product_type === "digital" ? "digital" : "physical",
                cover_image_url: String(row.cover_image_url ?? ""),
                is_active: Number(row.is_active ?? 0),
                updated_at: String(row.updated_at ?? ""),
            })),
            meta: {
                type: type ?? "all",
                query,
                sort,
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
