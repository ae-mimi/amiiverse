import type { APIRoute } from "astro";
import { sanityClient } from "sanity:client";
import { getCloudflareRuntimeEnv } from "../../../lib/server/cloudflareRuntimeEnv";
import {
    portableTextToHtml,
    portableTextToPlainText,
    type PortableTextBlock,
} from "../../../lib/sanity/portableText";
import {
    getFxRate,
    normalizeCountry,
    normalizeCurrency,
    normalizeRegion,
    pickShippingMinor,
    pickTaxRateBps,
} from "../../../lib/server/ecom";

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

interface SanityProductDetails {
    shortDescription?: string;
    description?: PortableTextBlock[];
    galleryImages?: string[];
    coverImageUrl?: string;
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
        if (!slug) return jsonResponse({ error: "Missing slug parameter" }, 400);

        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;
        if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

        const currency = normalizeCurrency(url.searchParams.get("currency"));
        const country = normalizeCountry(url.searchParams.get("country"));
        const region = normalizeRegion(url.searchParams.get("region"));
        const fxRate = await getFxRate(db, currency);

        const product = await db
            .prepare(
                `SELECT
                    id,
                    slug,
                    title,
                    description,
                    product_type,
                    cover_image_url,
                    is_active,
                    updated_at
                 FROM products
                 WHERE slug = ? AND is_active = 1
                 LIMIT 1`,
            )
            .bind(slug)
            .first();
        if (!product) return jsonResponse({ error: "Product not found" }, 404);

        let sanityProduct: SanityProductDetails | null = null;
        try {
            sanityProduct = await sanityClient.fetch<SanityProductDetails | null>(
                `*[_type == "product" && slug.current == $slug][0]{
                    shortDescription,
                    description,
                    "galleryImages": galleryImages[].asset->url,
                    "coverImageUrl": coverImage.asset->url
                }`,
                { slug },
            );
        } catch (error) {
            console.warn("[shop/product] failed to fetch Sanity product details", error);
        }

        const variantRows = await db
            .prepare(
                `SELECT
                    pv.id,
                    pv.sku,
                    pv.title,
                    pv.options_json,
                    pv.base_price_minor_ngn,
                    pv.weight_grams,
                    pv.is_active,
                    COALESCE(i.on_hand, 0) AS on_hand,
                    COALESCE(i.reserved, 0) AS reserved,
                    COALESCE(i.safety_stock, 0) AS safety_stock
                 FROM product_variants pv
                 LEFT JOIN inventory i ON i.variant_id = pv.id
                 WHERE pv.product_id = ?
                 ORDER BY pv.created_at ASC`,
            )
            .bind(String(product.id))
            .all();
        const variants = (variantRows.results ?? []).map((row) => {
            const baseMinorNgn = Math.max(0, Number(row.base_price_minor_ngn ?? 0));
            const available =
                Math.max(0, Number(row.on_hand || 0) - Number(row.reserved || 0) - Number(row.safety_stock || 0));
            return {
                id: String(row.id ?? ""),
                sku: String(row.sku ?? ""),
                title: String(row.title ?? ""),
                options: JSON.parse(String(row.options_json ?? "{}")),
                price_ngn: baseMinorNgn,
                price_minor: Math.round(baseMinorNgn * fxRate),
                currency,
                weight_grams: Math.max(0, Number(row.weight_grams ?? 0)),
                is_active: Number(row.is_active ?? 0),
                stock: {
                    available,
                    is_in_stock: available > 0,
                },
            };
        });

        const firstActive = variants.find((v) => v.is_active === 1) ?? variants[0];
        const shippingMinor = await pickShippingMinor(db, {
            country,
            region,
            currency,
            subtotalMinor: firstActive?.price_minor ?? 0,
            weightGrams: firstActive?.weight_grams ?? 0,
        });
        const taxRateBps = await pickTaxRateBps(db, {
            country,
            region,
            productType:
                String(product.product_type || "physical") === "digital"
                    ? "digital"
                    : "physical",
        });

        const shortDescription =
            String(sanityProduct?.shortDescription ?? "").trim() ||
            String(product.description ?? "").trim();
        const longDescriptionHtml =
            portableTextToHtml(sanityProduct?.description) ||
            (shortDescription ? `<p>${shortDescription}</p>` : "");
        const longDescriptionPlain =
            portableTextToPlainText(sanityProduct?.description) || shortDescription;
        const galleryImages = Array.isArray(sanityProduct?.galleryImages)
            ? sanityProduct!.galleryImages!.filter(Boolean)
            : [];
        const coverImageUrl = String(
            sanityProduct?.coverImageUrl ?? product.cover_image_url ?? "",
        );

        return jsonResponse({
            product: {
                id: String(product.id ?? ""),
                slug: String(product.slug ?? ""),
                title: String(product.title ?? ""),
                description: shortDescription,
                short_description: shortDescription,
                long_description_plain: longDescriptionPlain,
                long_description_html: longDescriptionHtml,
                product_type:
                    String(product.product_type || "physical") === "digital"
                        ? "digital"
                        : "physical",
                cover_image_url: coverImageUrl,
                gallery_images: galleryImages,
                is_active: Number(product.is_active ?? 0),
                updated_at: String(product.updated_at ?? ""),
            },
            variants,
            pricing_hints: {
                currency,
                fx_rate: fxRate,
                tax_rate_bps: taxRateBps,
                shipping_minor: shippingMinor,
            },
            destination: {
                country,
                region,
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
