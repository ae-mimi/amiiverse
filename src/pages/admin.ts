import type { APIRoute } from "astro";

const CMS_URL = "https://aviiysjatn84yq1fp6j7lv8w.sanity.studio/";

export const GET: APIRoute = async () => {
    return Response.redirect(CMS_URL, 302);
};
