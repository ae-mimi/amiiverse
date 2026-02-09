import { sanityClient } from "sanity:client";
import imageUrlBuilder from "@sanity/image-url";

export const imageBuilder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
    if (!source) return "";
    return imageBuilder.image(source).auto("format").fit("max").url();
}

export async function getSanityContent(query: string, params: Record<string, any> = {}) {
    try {
        const data = await sanityClient.fetch(query, params);
        return data;
    } catch (error) {
        console.error("Sanity fetch error:", error);
        return null;
    }
}

// Queries
export const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]`;
export const SETTINGS_QUERY = `*[_type == "settings"][0]`;
export const ALL_PAGES_QUERY = `*[_type == "page"]{ "slug": slug.current }`;
