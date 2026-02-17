import type { APIRoute } from "astro";
import { getCloudflareRuntimeEnv } from "../../../lib/server/cloudflareRuntimeEnv";

export const prerender = false;

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

function normalizeQuery(value: string | null): string {
    return (value ?? "").trim().slice(0, 120);
}

export const GET: APIRoute = async ({ url, locals }) => {
    try {
        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;
        if (!db) return jsonResponse({ error: "Missing D1 binding `DB`" }, 500);

        const query = normalizeQuery(url.searchParams.get("query"));
        const params: unknown[] = [];

        let sql = "";
        if (query) {
            sql = `
                SELECT
                    m.id,
                    m.slug,
                    m.title,
                    m.description,
                    m.release_date,
                    m.cover_image_url,
                    m.spotify_url,
                    m.apple_music_url,
                    m.youtube_music_url,
                    m.audio_url
                FROM music_cache m
                INNER JOIN music_fts f ON f.rowid = m.rowid
                WHERE m.is_active = 1 AND f.music_fts MATCH ?
                ORDER BY m.release_date DESC, m.updated_at DESC
                LIMIT 60
            `;
            params.push(`${query}*`);
        } else {
            sql = `
                SELECT
                    m.id,
                    m.slug,
                    m.title,
                    m.description,
                    m.release_date,
                    m.cover_image_url,
                    m.spotify_url,
                    m.apple_music_url,
                    m.youtube_music_url,
                    m.audio_url
                FROM music_cache m
                WHERE m.is_active = 1
                ORDER BY m.release_date DESC, m.updated_at DESC
                LIMIT 60
            `;
        }

        const result = await db.prepare(sql).bind(...params).all();
        const rows = result.results ?? [];

        return jsonResponse({
            items: rows.map((row) => ({
                id: String(row.id ?? ""),
                slug: String(row.slug ?? ""),
                title: String(row.title ?? ""),
                description: String(row.description ?? ""),
                date: String(row.release_date ?? ""),
                cover_image_url: String(row.cover_image_url ?? ""),
                spotify: String(row.spotify_url ?? ""),
                apple_music: String(row.apple_music_url ?? ""),
                youtube_music: String(row.youtube_music_url ?? ""),
                audio_url: String(row.audio_url ?? ""),
            })),
            meta: {
                query,
            },
        });
    } catch (error: any) {
        console.error("[music/search] failed", error);
        return jsonResponse(
            { error: error?.message || "Failed to search music" },
            500,
        );
    }
};
