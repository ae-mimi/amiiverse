import type { APIRoute } from "astro";

const CMS_URL = "https://weareamii.sanity.studio/";

export const GET: APIRoute = async () => {
    return Response.redirect(CMS_URL, 302);
};
