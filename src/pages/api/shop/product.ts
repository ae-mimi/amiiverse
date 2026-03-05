import type { APIRoute } from "astro";
import { getCloudflareRuntimeEnv } from "../../../lib/server/cloudflareRuntimeEnv";

export const prerender = false;

type ProductType = "physical" | "digital";

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    first: () => Promise<Record<string, unknown> | null>;
}

interface D1DatabaseLike {
    prepare: (query: string) => D1PreparedStatementLike;
}

interface ShopProductRow {
    id: string;
    slug: string;
    title: string;
    description?: string;
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

function normalizeSlug(value: string | null): string {
    return (value ?? "").trim().slice(0, 120);
}

export const GET: APIRoute = async ({ url, locals }) => {
    try {
        const slug = normalizeSlug(url.searchParams.get("slug"));
        if (!slug) {
            return jsonResponse({ error: "Missing slug parameter" }, 400);
        }

        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;
        if (!db) {
            return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);
        }

        const row = (await db
            .prepare(
                `SELECT
                    id,
                    slug,
                    title,
                    description,
                    price_ngn,
                    product_type,
                    cover_image_url,
                    is_active,
                    updated_at
                 FROM products_cache
                 WHERE slug = ? AND is_active = 1
                 LIMIT 1`,
            )
            .bind(slug)
            .first()) as ShopProductRow | null;

        if (!row) {
            return jsonResponse({ error: "Product not found" }, 404);
        }

        return jsonResponse({
            product: {
                id: String(row.id ?? ""),
                slug: String(row.slug ?? ""),
                title: String(row.title ?? ""),
                description: String(row.description ?? ""),
                price_ngn: Number(row.price_ngn ?? 0),
                product_type:
                    row.product_type === "digital" ? "digital" : "physical",
                cover_image_url: String(row.cover_image_url ?? ""),
                is_active: Number(row.is_active ?? 0),
                updated_at: String(row.updated_at ?? ""),
            },
        });
    } catch (error: any) {
        console.error("[shop/product] failed", error);
        return jsonResponse(
            { error: error?.message || "Failed to load product" },
            500,
        );
    }
};
