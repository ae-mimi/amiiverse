/**
 * Sanity client — thin wrapper over the Astro-provided Sanity client.
 * All GROQ fetches should go through `fetchSanity()` for consistent
 * error-handling and logging.
 */
import { sanityClient } from "sanity:client";

export { sanityClient };

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
