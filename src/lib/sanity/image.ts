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
export function urlFor(source: any): string {
    if (!source) return "";
    return builder.image(source).auto("format").fit("max").url();
}

/**
 * Build an image URL at a specific width (for responsive srcset).
 */
export function urlForWidth(source: any, width: number): string {
    if (!source) return "";
    return builder.image(source).width(width).auto("format").url();
}

export { builder as imageBuilder };
