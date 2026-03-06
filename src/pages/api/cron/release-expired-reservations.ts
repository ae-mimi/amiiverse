import type { APIRoute } from "astro";
import { getServerEnvValue } from "../../../lib/server/cloudflareRuntimeEnv";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
    const adminToken = getServerEnvValue({ locals }, "ADMIN_SYNC_TOKEN");
    if (!adminToken) {
        return new Response("Missing ADMIN_SYNC_TOKEN", { status: 500 });
    }

    const origin = new URL(request.url).origin;
    const response = await fetch(
        `${origin}/api/admin/release-expired-reservations?token=${encodeURIComponent(adminToken)}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ttlMinutes: 20, limit: 200 }),
        },
    );
    return new Response(await response.text(), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
    });
};
