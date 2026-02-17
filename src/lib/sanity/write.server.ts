import { createClient } from "@sanity/client";
import type { APIContext } from "astro";
import { getServerEnvValue } from "../server/cloudflareRuntimeEnv";

export function getSanityWriteClient(context: Pick<APIContext, "locals">) {
    const token = getServerEnvValue(context, "SANITY_WRITE_TOKEN");

    return createClient({
        projectId: "pxn399gi",
        dataset: "production",
        apiVersion: "2024-01-01",
        useCdn: false,
        token,
    });
}
