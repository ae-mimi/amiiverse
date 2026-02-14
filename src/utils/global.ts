import settings from "../data/settings.json";
import { fetchSanity as getSanityContent } from "../lib/sanity/client";
import { SETTINGS_QUERY } from "../lib/sanity/queries";

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
    return settings as SiteSettings;
}

export async function fetchGlobalSettings(): Promise<SiteSettings> {
    const sanitySettings = await getSanityContent(SETTINGS_QUERY);

    if (sanitySettings) {
        // Merge sanity settings over default settings to ensure structure
        // This is a simple shallow merge for top-level, but for nested objects like site_info/footer/socials 
        // we might want to be careful. However, Sanity usually returns the whole object structure if defined.
        // For safety, we can return sanitySettings if valid, or fallback.

        // We'll use a spread to override defaults with sanity data.
        // Note: Arrays like 'nav' and 'socials' will be replaced entirely, which is usually desired behavior for CMS.
        return {
            ...settings,
            ...sanitySettings,
            site_info: { ...settings.site_info, ...sanitySettings.site_info },
            footer: { ...settings.footer, ...sanitySettings.footer },
        } as SiteSettings;
    }

    return settings as SiteSettings;
}
