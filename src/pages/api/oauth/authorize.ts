export const prerender = false;

export async function GET({ redirect, request }) {
    const client_id = import.meta.env.GITHUB_CLIENT_ID;

    if (!client_id) {
        return new Response("GITHUB_CLIENT_ID not configured", { status: 500 });
    }

    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", client_id);
    url.searchParams.set("scope", "repo,user");
    // Optional: Add state parameter for security

    return redirect(url.toString());
}
