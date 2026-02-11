import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ redirect, cookies }) => {
    const client_id = import.meta.env.GITHUB_CLIENT_ID;

    if (!client_id) {
        return new Response("GITHUB_CLIENT_ID not configured", { status: 500 });
    }

    const state = crypto.randomUUID();

    cookies.set("oauth_state", state, {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 600, // 10 minutes
    });

    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", client_id);
    url.searchParams.set("scope", "repo,user");
    url.searchParams.set("state", state);

    return redirect(url.toString());
}
