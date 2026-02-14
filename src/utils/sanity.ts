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
export const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]{
    ...,
    blocks[]{
        ...,
        _type == "widget" => {
            ...,
            music_item->{
                title,
                cover,
                performed_by,
                lyrics,
                producer,
                spotify,
                apple_music,
                youtube_music,
                "audio_url": audio_file.asset->url
            }
        }
    }
}`;
export const SETTINGS_QUERY = `*[_type == "settings"][0]{
    ...,
    "logo_navy": logo_navy.asset->url,
    "logo_yellow": logo_yellow.asset->url,
    "favicons": {
        "ico": favicons.ico.asset->url,
        "svg": favicons.svg.asset->url,
        "png96": favicons.png96.asset->url,
        "apple": favicons.apple.asset->url,
        "manifest192": favicons.manifest192.asset->url,
        "manifest512": favicons.manifest512.asset->url
    },
    "site_info": {
        "title": title,
        "description": description,
        "logo_navy": logo_navy.asset->url,
        "logo_yellow": logo_yellow.asset->url
    }
}`;
export const ALL_PAGES_QUERY = `*[_type == "page"]{ "slug": slug.current }`;
