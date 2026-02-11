import type { APIRoute } from "astro";
import { getOAuthSuccessHtml } from "../../../utils/oauth-templates";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies.get("oauth_state")?.value;

    const client_id = import.meta.env.GITHUB_CLIENT_ID;
    const client_secret = import.meta.env.GITHUB_CLIENT_SECRET;

    if (!code) {
        return new Response("No code provided", { status: 400 });
    }

    if (!state || !storedState || state !== storedState) {
        return new Response("Invalid state parameter", { status: 403 });
    }

    cookies.delete("oauth_state", { path: "/" });

    if (!client_id || !client_secret) {
        return new Response("GitHub credentials not configured", { status: 500 });
    }

    try {
        const response = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id,
                client_secret,
                code,
            }),
        });

        const data = await response.json();
        const token = data.access_token;

        if (!token) {
            return new Response(JSON.stringify(data), { status: 400 });
        }

        // Return HTML that posts the message back to the CMS window
        const html = getOAuthSuccessHtml(token);

        return new Response(html, {
            headers: { "Content-Type": "text/html" },
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return new Response(errorMessage, { status: 500 });
    }
}
