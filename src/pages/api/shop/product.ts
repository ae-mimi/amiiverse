import type { APIRoute } from "astro";
import { sanityClient } from "sanity:client";
import { getCloudflareRuntimeEnv } from "../../../lib/server/cloudflareRuntimeEnv";

export const prerender = false;

type ProductType = "physical" | "digital";

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    first: () => Promise<Record<string, unknown> | null>;
    run: () => Promise<Record<string, unknown>>;
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

interface SanityPortableTextSpan {
    _type?: string;
    text?: string;
}

interface SanityPortableTextBlock {
    _type?: string;
    children?: SanityPortableTextSpan[];
}

interface SanityProductFallback {
    _id: string;
    slug?: string;
    title?: string;
    shortDescription?: string;
    description?: SanityPortableTextBlock[];
    price?: number;
    productType?: string;
    coverImageUrl?: string;
    isActive?: boolean;
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

function sanitizeProductType(value: string | undefined): ProductType {
    return value === "digital" ? "digital" : "physical";
}

function toPlainText(blocks: SanityPortableTextBlock[] | undefined): string {
    if (!Array.isArray(blocks) || blocks.length === 0) return "";

    return blocks
        .filter((block) => block?._type === "block")
        .map((block) =>
            (block.children ?? [])
                .filter((child) => child?._type === "span")
                .map((child) => (child.text ?? "").trim())
                .filter(Boolean)
                .join(" "),
        )
        .filter(Boolean)
        .join("\n")
        .trim();
}

async function fetchSanityProductBySlug(
    slug: string,
): Promise<SanityProductFallback | null> {
    const query = `*[_type == "product" && slug.current == $slug][0]{
      _id,
      "slug": slug.current,
      title,
      shortDescription,
      description,
      price,
      productType,
      "coverImageUrl": coverImage.asset->url,
      isActive
    }`;

    const product = await sanityClient.fetch<SanityProductFallback | null>(query, {
        slug,
    });

    return product ?? null;
}

async function upsertFallbackProductToCache(
    db: D1DatabaseLike,
    product: SanityProductFallback,
): Promise<void> {
    const id = String(product._id ?? "").trim();
    const slug = String(product.slug ?? "").trim();
    const title = String(product.title ?? "").trim();
    if (!id || !slug || !title) return;

    const description =
        String(product.shortDescription ?? "").trim() ||
        toPlainText(product.description);
    const priceNgn = Number.isFinite(Number(product.price))
        ? Math.round(Number(product.price))
        : 0;
    const productType = sanitizeProductType(product.productType);
    const coverImageUrl = String(product.coverImageUrl ?? "").trim();
    const isActive = product.isActive === false ? 0 : 1;

    await db
        .prepare(
            `INSERT INTO products_cache (
                id,
                slug,
                title,
                description,
                price_ngn,
                product_type,
                cover_image_url,
                is_active,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                slug = excluded.slug,
                title = excluded.title,
                description = excluded.description,
                price_ngn = excluded.price_ngn,
                product_type = excluded.product_type,
                cover_image_url = excluded.cover_image_url,
                is_active = excluded.is_active,
                updated_at = excluded.updated_at`,
        )
        .bind(
            id,
            slug,
            title,
            description,
            priceNgn,
            productType,
            coverImageUrl,
            isActive,
            new Date().toISOString(),
        )
        .run();
}

async function findProductBySlug(
    db: D1DatabaseLike,
    slug: string,
): Promise<ShopProductRow | null> {
    return (await db
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

        let row = await findProductBySlug(db, slug);

        if (!row) {
            const sanityProduct = await fetchSanityProductBySlug(slug);
            if (sanityProduct && sanityProduct.isActive !== false) {
                await upsertFallbackProductToCache(db, sanityProduct);
                row = await findProductBySlug(db, slug);
            }
        }

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
