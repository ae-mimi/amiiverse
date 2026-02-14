/**
 * Sanity client — thin wrapper over the Astro-provided Sanity client.
 * All GROQ fetches should go through `fetchSanity()` for consistent
 * error-handling and logging.
 */
import { sanityClient } from "sanity:client";
import { createClient } from "@sanity/client";

export { sanityClient };

/**
 * Write-capable Sanity client for mutations (create, patch, delete).
 * Requires SANITY_WRITE_TOKEN env variable with an Editor or higher token.
 */
export const sanityWriteClient = createClient({
    projectId: "pxn399gi",
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
    token: import.meta.env.SANITY_WRITE_TOKEN,
});

export async function fetchSanity<T = any>(
    query: string,
    params: Record<string, any> = {},
): Promise<T | null> {
    try {
        return await sanityClient.fetch<T>(query, params);
    } catch (error) {
        console.error("[sanity] Fetch error:", error);
        return null;
    }
}
