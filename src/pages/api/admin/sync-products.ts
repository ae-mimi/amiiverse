import type { APIRoute } from "astro";
import { sanityClient } from "sanity:client";
import {
    getCloudflareRuntimeEnv,
    getServerEnvValue,
} from "../../../lib/server/cloudflareRuntimeEnv";

export const prerender = false;

interface SanityPortableTextSpan {
    _type?: string;
    text?: string;
}

interface SanityPortableTextBlock {
    _type?: string;
    children?: SanityPortableTextSpan[];
}

interface SanityProduct {
    _id: string;
    _updatedAt?: string;
    title?: string;
    slug?: string;
    description?: SanityPortableTextBlock[];
    shortDescription?: string;
    price?: number;
    productType?: string;
    coverImageUrl?: string;
    r2Key?: string;
    isActive?: boolean;
    badges?: string[];
}

interface SanityTrack {
    _id: string;
    _updatedAt?: string;
    title?: string;
    slug?: string;
    description?: string;
    releaseDate?: string;
    coverImageUrl?: string;
    spotify?: string;
    appleMusic?: string;
    youtubeMusic?: string;
    audioUrl?: string;
}

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
}

interface D1DatabaseLike {
    prepare: (query: string) => D1PreparedStatementLike;
    batch: (
        statements: D1PreparedStatementLike[],
    ) => Promise<Array<Record<string, unknown>>>;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function sanitizeProductType(value: string | undefined): "physical" | "digital" {
    return value === "digital" ? "digital" : "physical";
}

function toPlainText(blocks: SanityPortableTextBlock[] | undefined): string {
    if (!Array.isArray(blocks) || blocks.length === 0) return "";

    const lines = blocks
        .filter((block) => block?._type === "block")
        .map((block) =>
            (block.children ?? [])
                .filter((child) => child?._type === "span")
                .map((child) => (child.text ?? "").trim())
                .filter(Boolean)
                .join(" "),
        )
        .filter(Boolean);

    return lines.join("\n").trim();
}

async function fetchSanityProducts(): Promise<SanityProduct[]> {
    const query = `*[_type == "product"]{
      _id,
      _updatedAt,
      title,
      "slug": slug.current,
      description,
      shortDescription,
      price,
      productType,
      "coverImageUrl": coverImage.asset->url,
      r2Key,
      isActive,
      badges
    }`;

    const products = await sanityClient.fetch<SanityProduct[]>(query);
    return Array.isArray(products) ? products : [];
}

async function fetchSanityTracks(): Promise<SanityTrack[]> {
    const query = `*[_type == "track"]{
      _id,
      _updatedAt,
      title,
      "slug": slug.current,
      "description": coalesce(story, lyrics, ""),
      "releaseDate": release->releaseDate,
      "coverImageUrl": release->artwork.asset->url,
      "spotify": platformLinks.spotify,
      "appleMusic": platformLinks.apple,
      "youtubeMusic": platformLinks.youtube,
      "audioUrl": previewUrl
    }`;

    const tracks = await sanityClient.fetch<SanityTrack[]>(query);
    return Array.isArray(tracks) ? tracks : [];
}

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const adminToken = getServerEnvValue({ locals }, "ADMIN_SYNC_TOKEN");
        const providedToken = request.headers.get("x-admin-token") ?? "";

        if (!adminToken) {
            return jsonResponse({ error: "Missing ADMIN_SYNC_TOKEN" }, 500);
        }

        if (!providedToken || providedToken !== adminToken) {
            return jsonResponse({ error: "Unauthorized" }, 401);
        }

        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;

        if (!db) {
            return jsonResponse(
                { error: "Missing D1 binding `DB` in runtime env" },
                500,
            );
        }

        const sanityProducts = await fetchSanityProducts();
        const sanityTracks = await fetchSanityTracks();
        const skippedIds: string[] = [];
        const skippedTrackIds: string[] = [];

        const upserts = sanityProducts.flatMap((product) => {
            const title = (product.title ?? "").trim();
            const slug = (product.slug ?? "").trim();
            if (!product._id || !title || !slug) {
                if (product?._id) skippedIds.push(product._id);
                return [];
            }

            const description =
                (product.shortDescription ?? "").trim() ||
                toPlainText(product.description);
            const priceNgn = Number.isFinite(Number(product.price))
                ? Math.round(Number(product.price))
                : 0;
            const productType = sanitizeProductType(product.productType);
            const coverImageUrl = (product.coverImageUrl ?? "").trim();
            const r2Key = String(product.r2Key ?? "").trim();
            const isActive = product.isActive === false ? 0 : 1;
            const updatedAt =
                (product._updatedAt ?? new Date().toISOString()).trim();

            return [
                db
                .prepare(
                    `INSERT INTO products_cache (
                        id,
                        slug,
                        title,
                        description,
                        price_ngn,
                        product_type,
                        cover_image_url,
                        r2_key,
                        is_active,
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        slug = excluded.slug,
                        title = excluded.title,
                        description = excluded.description,
                        price_ngn = excluded.price_ngn,
                        product_type = excluded.product_type,
                        cover_image_url = excluded.cover_image_url,
                        r2_key = excluded.r2_key,
                        is_active = excluded.is_active,
                        updated_at = excluded.updated_at`,
                )
                .bind(
                    product._id,
                    slug,
                    title,
                    description,
                    priceNgn,
                    productType,
                    coverImageUrl,
                    r2Key || null,
                    isActive,
                    updatedAt,
                ),
            ];
        });

        if (upserts.length > 0) {
            await db.batch(upserts);
        }

        const musicUpserts = sanityTracks.flatMap((track) => {
            const title = String(track.title ?? "").trim();
            if (!track._id || !title) {
                if (track?._id) skippedTrackIds.push(track._id);
                return [];
            }

            const slug = String(track.slug ?? "").trim();
            const description = String(track.description ?? "").trim();
            const releaseDate = String(track.releaseDate ?? "").trim();
            const coverImageUrl = String(track.coverImageUrl ?? "").trim();
            const spotify = String(track.spotify ?? "").trim();
            const appleMusic = String(track.appleMusic ?? "").trim();
            const youtubeMusic = String(track.youtubeMusic ?? "").trim();
            const audioUrl = String(track.audioUrl ?? "").trim();
            const updatedAt = String(
                track._updatedAt ?? new Date().toISOString(),
            ).trim();

            return [
                db
                    .prepare(
                        `INSERT INTO music_cache (
                            id,
                            slug,
                            title,
                            description,
                            release_date,
                            cover_image_url,
                            spotify_url,
                            apple_music_url,
                            youtube_music_url,
                            audio_url,
                            is_active,
                            updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            slug = excluded.slug,
                            title = excluded.title,
                            description = excluded.description,
                            release_date = excluded.release_date,
                            cover_image_url = excluded.cover_image_url,
                            spotify_url = excluded.spotify_url,
                            apple_music_url = excluded.apple_music_url,
                            youtube_music_url = excluded.youtube_music_url,
                            audio_url = excluded.audio_url,
                            is_active = excluded.is_active,
                            updated_at = excluded.updated_at`,
                    )
                    .bind(
                        track._id,
                        slug || null,
                        title,
                        description,
                        releaseDate || null,
                        coverImageUrl || null,
                        spotify || null,
                        appleMusic || null,
                        youtubeMusic || null,
                        audioUrl || null,
                        1,
                        updatedAt,
                    ),
            ];
        });

        if (musicUpserts.length > 0) {
            await db.batch(musicUpserts);
        }

        await db.batch([
            db.prepare("DELETE FROM products_fts"),
            db.prepare(
                `INSERT INTO products_fts (rowid, title, description, tags, slug)
                 SELECT
                     rowid,
                     COALESCE(title, ''),
                     COALESCE(description, ''),
                     COALESCE(product_type, ''),
                     COALESCE(slug, '')
                 FROM products_cache`,
            ),
            db.prepare("DELETE FROM music_fts"),
            db.prepare(
                `INSERT INTO music_fts (rowid, title, description, tags, slug)
                 SELECT
                     rowid,
                     COALESCE(title, ''),
                     COALESCE(description, ''),
                     '',
                     COALESCE(slug, '')
                 FROM music_cache
                 WHERE is_active = 1`,
            ),
        ]);

        return jsonResponse({
            ok: true,
            synced: upserts.length,
            syncedMusic: musicUpserts.length,
            fetched: sanityProducts.length,
            fetchedMusic: sanityTracks.length,
            skipped: skippedIds.length,
            skippedMusic: skippedTrackIds.length,
            message: "Products synced from Sanity to D1 cache and FTS rebuilt",
        });
    } catch (error: any) {
        console.error("[admin/sync-products] sync failed", error);
        return jsonResponse(
            {
                error:
                    error?.message || "Failed to sync products from Sanity to D1",
            },
            500,
        );
    }
};
