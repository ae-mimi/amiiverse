import settings from "../data/settings.json";
import { fetchSanity as getSanityContent } from "../lib/sanity/client";
import {
    ACTIVE_CAMPAIGN_FAVICON_OVERRIDE_QUERY,
    ACTIVE_CAMPAIGN_LOGO_OVERRIDE_QUERY,
    SETTINGS_QUERY,
} from "../lib/sanity/queries";

export interface SiteSettings {
    site_info: {
        title: string;
        description: string;
        logo_navy?: string;
        logo_yellow?: string;
    };
    title?: string;
    description?: string;
    logo_navy?: string;
    logo_yellow?: string;
    enable_follow_link?: boolean;
    keywords?: string[];
    seo?: {
        og_image?: string;
        meta_title?: string;
        meta_description?: string;
    };
    favicons?: {
        ico?: string;
        svg?: string;
        png96?: string;
        apple?: string;
        manifest192?: string;
        manifest512?: string;
        webmanifest?: string;
    };
    navigationItems: {
        showInHeader: boolean;
        showInFooter: boolean;
        is_special?: boolean;
        disabled?: boolean;
        link: {
            label?: string;
            type: 'internal' | 'external' | 'download' | 'email' | 'phone';
            url?: string;
            internalRef?: {
                slug: string;
            };
        };
    }[];
    footer: {
        businessName?: string;
        contactEmail?: string;
        copyright: string;
    };
    socials: {
        platform: string;
        url: string;
        icon: string;
    }[];
}

export function getGlobalSettings(): SiteSettings {
    return normalizeSettings(settings);
}

export async function fetchGlobalSettings(): Promise<SiteSettings> {
    const sanitySettings = await getSanityContent(SETTINGS_QUERY);
    const campaignLogoOverride = await getSanityContent<{
        logo_navy?: string;
        logo_yellow?: string;
    }>(ACTIVE_CAMPAIGN_LOGO_OVERRIDE_QUERY);
    const campaignFaviconOverride = await getSanityContent<{
        favicons?: SiteSettings["favicons"];
    }>(ACTIVE_CAMPAIGN_FAVICON_OVERRIDE_QUERY);

    if (sanitySettings) {
        // Merge sanity settings over default settings to ensure structure
        // This is a simple shallow merge for top-level, but for nested objects like site_info/footer/socials 
        // we might want to be careful. However, Sanity usually returns the whole object structure if defined.
        // For safety, we can return sanitySettings if valid, or fallback.

        // We'll use a spread to override defaults with sanity data.
        // Note: Arrays like 'nav' and 'socials' will be replaced entirely, which is usually desired behavior for CMS.
        const merged = {
            ...settings,
            ...sanitySettings,
            site_info: { ...settings.site_info, ...sanitySettings.site_info },
            footer: { ...settings.footer, ...sanitySettings.footer },
            favicons: { ...settings.favicons, ...sanitySettings.favicons },
        };

        if (campaignLogoOverride?.logo_navy) {
            merged.logo_navy = campaignLogoOverride.logo_navy;
            merged.site_info = {
                ...merged.site_info,
                logo_navy: campaignLogoOverride.logo_navy,
            };
        }

        if (campaignLogoOverride?.logo_yellow) {
            merged.logo_yellow = campaignLogoOverride.logo_yellow;
            merged.site_info = {
                ...merged.site_info,
                logo_yellow: campaignLogoOverride.logo_yellow,
            };
        }

        if (campaignFaviconOverride?.favicons) {
            merged.favicons = {
                ...merged.favicons,
                ...campaignFaviconOverride.favicons,
            };
        }

        return normalizeSettings(merged);
    }

    return normalizeSettings(settings);
}

function asArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback;
}

function normalizeSettings(input: unknown): SiteSettings {
    const raw = (input ?? {}) as Record<string, any>;
    const siteInfo = (raw.site_info ?? {}) as Record<string, any>;
    const footer = (raw.footer ?? {}) as Record<string, any>;
    const seo = (raw.seo ?? {}) as Record<string, any>;
    const favicons = (raw.favicons ?? {}) as Record<string, any>;

    return {
        ...settings,
        ...raw,
        site_info: {
            ...settings.site_info,
            ...siteInfo,
            title: asString(siteInfo.title, settings.site_info.title),
            description: asString(siteInfo.description, settings.site_info.description),
            logo_navy: asString(siteInfo.logo_navy, settings.site_info.logo_navy || ""),
            logo_yellow: asString(siteInfo.logo_yellow, settings.site_info.logo_yellow || ""),
        },
        title: asString(raw.title, settings.title || settings.site_info.title),
        description: asString(raw.description, settings.description || settings.site_info.description),
        logo_navy: asString(raw.logo_navy, settings.logo_navy || settings.site_info.logo_navy || ""),
        logo_yellow: asString(raw.logo_yellow, settings.logo_yellow || settings.site_info.logo_yellow || ""),
        enable_follow_link: Boolean(raw.enable_follow_link),
        keywords: asArray<string>(raw.keywords).filter((k) => typeof k === "string"),
        seo: {
            ...settings.seo,
            ...seo,
            og_image: asString(seo.og_image, settings.seo?.og_image || ""),
            meta_title: asString(seo.meta_title, settings.seo?.meta_title || ""),
            meta_description: asString(seo.meta_description, settings.seo?.meta_description || ""),
        },
        favicons: {
            ...settings.favicons,
            ...favicons,
            ico: asString(favicons.ico, settings.favicons?.ico || ""),
            svg: asString(favicons.svg, settings.favicons?.svg || ""),
            png96: asString(favicons.png96, settings.favicons?.png96 || ""),
            apple: asString(favicons.apple, settings.favicons?.apple || ""),
            manifest192: asString(favicons.manifest192, settings.favicons?.manifest192 || ""),
            manifest512: asString(favicons.manifest512, settings.favicons?.manifest512 || ""),
            webmanifest: asString(favicons.webmanifest, settings.favicons?.webmanifest || ""),
        },
        navigationItems: asArray<any>(raw.navigationItems)
            .filter((item) => item && typeof item === "object")
            .map((item) => {
                const link = (item.link ?? {}) as Record<string, any>;
                const internalRef = (link.internalRef ?? {}) as Record<string, any>;
                return {
                    showInHeader: Boolean(item.showInHeader),
                    showInFooter: Boolean(item.showInFooter),
                    is_special: Boolean(item.is_special),
                    disabled: Boolean(item.disabled),
                    link: {
                        label: asString(link.label, "Untitled"),
                        type: asString(link.type, "external") as SiteSettings["navigationItems"][number]["link"]["type"],
                        url: asString(link.url, ""),
                        internalRef: {
                            slug: asString(internalRef.slug, ""),
                        },
                    },
                };
            }),
        footer: {
            ...settings.footer,
            ...footer,
            businessName: asString(footer.businessName, settings.footer.businessName || ""),
            contactEmail: asString(footer.contactEmail, settings.footer.contactEmail || ""),
            copyright: asString(
                footer.copyright,
                settings.footer.copyright || "© {currentYear} amii<br/>Operated by MAPDY LTD",
            ),
        },
        socials: asArray<any>(raw.socials)
            .filter((social) => social && typeof social === "object")
            .map((social) => ({
                platform: asString(social.platform, ""),
                url: asString(social.url, ""),
                icon: asString(social.icon, ""),
            }))
            .filter((social) => social.platform && social.url),
    };
}
