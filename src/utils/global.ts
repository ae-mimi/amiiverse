import settings from "../data/settings.json";

export interface SiteSettings {
    enable_follow_link: boolean;
    site_info: {
        title: string;
        description: string;
        logo_navy: string;
        logo_yellow: string;
        favicon: string;
    };
    nav: {
        label: string;
        href: string;
    }[];
    footer: {
        copyright: string;
        links: {
            label: string;
            href: string;
            is_special?: boolean;
            disabled?: boolean;
        }[];
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
