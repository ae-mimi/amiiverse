/**
 * Sanity image URL builder helpers.
 */
import { sanityClient } from "sanity:client";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(sanityClient);

/**
 * Build a Sanity image URL.
 * Returns an empty string for falsy sources so templates can safely use it.
 */
/**
 * Build a Sanity image URL with a safety wrapper.
 * Returns an empty string for falsy sources.
 * Handles malformed asset refs by cleaning them (e.g. removing existing query params).
 */
export function urlFor(source: any, builderCallback?: (b: any) => any): string {
    if (!source) return "";

    // If source is already a string and looks like a URL, return it
    if (typeof source === 'string' && (source.startsWith('http') || source.startsWith('/'))) {
        return source;
    }

    // Attempt to clean the source if it has a malformed _ref
    let cleanSource = source;
    if (source?.asset?._ref && typeof source.asset._ref === 'string') {
        const ref = source.asset._ref;
        if (ref.includes('?')) {
            const cleanRef = ref.split('?')[0];
            cleanSource = { ...source, asset: { ...source.asset, _ref: cleanRef } };
        }
    }

    try {
        let imgBuilder = builder.image(cleanSource).auto("format");
        if (builderCallback) {
            imgBuilder = builderCallback(imgBuilder);
        }
        return imgBuilder.url() || "";
    } catch (e) {
        console.warn("Sanity urlFor failed:", e, "Source:", source);
        // Extreme fallback: if it's an object with a URL field, return it
        if (source?.asset?.url) return source.asset.url;
        return "";
    }
}

/**
 * Build an image URL at a specific width (for responsive srcset).
 */
export function urlForWidth(source: any, width: number): string {
    if (!source) return "";
    return builder.image(source).width(width).auto("format").url();
}

export { builder as imageBuilder };
