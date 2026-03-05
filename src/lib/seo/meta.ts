/**
 * Meta tag helper for <head>.
 * Merges page-level SEO with site-wide defaults.
 */
import type { SeoData, SiteSettings } from "../sanity/types";

export interface MetaTags {
    title: string;
    description: string;
    ogImage?: string;
    canonicalUrl?: string;
    noIndex: boolean;
}

export function buildMeta(
    pageSeo: SeoData | undefined,
    siteSettings: SiteSettings,
    pageTitle?: string,
): MetaTags {
    const defaults = siteSettings.defaultSeo;
    const siteTitle = siteSettings.title || "amii";

    const title =
        pageSeo?.title || pageTitle
            ? `${pageSeo?.title || pageTitle} — ${siteTitle}`
            : siteTitle;

    const description =
        pageSeo?.description ||
        defaults?.description ||
        siteSettings.description ||
        "";

    return {
        title,
        description,
        ogImage: pageSeo?.ogImage?.asset?.url || defaults?.ogImage?.asset?.url,
        canonicalUrl: pageSeo?.canonicalUrl || defaults?.canonicalUrl,
        noIndex: pageSeo?.noIndex ?? defaults?.noIndex ?? false,
    };
}
