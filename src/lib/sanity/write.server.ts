import { createClient } from "@sanity/client";
import type { APIContext } from "astro";
import { getServerEnvValue } from "../server/cloudflareRuntimeEnv";

export function getSanityWriteClient(context: Pick<APIContext, "locals">) {
    const token = getServerEnvValue(context, "SANITY_WRITE_TOKEN");
    const projectId =
        getServerEnvValue(context, "PUBLIC_SANITY_PROJECT_ID") || "pxn399gi";
    const dataset =
        getServerEnvValue(context, "PUBLIC_SANITY_DATASET") || "production";

    return createClient({
        projectId,
        dataset,
        apiVersion: "2024-01-01",
        useCdn: false,
        token,
    });
}