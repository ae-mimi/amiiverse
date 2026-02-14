import { fetchSanity } from "./sanity/client";
import { THEME_QUERY } from "./sanity/themeQueries";

export interface Theme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    mutedTextColor: string;
    buttonStyle: "filled" | "outline" | "ghost";
    borderRadiusScale: "small" | "medium" | "large";
    headingFont: string;
    bodyFont: string;
}

const DEFAULT_THEME: Theme = {
    primaryColor: '#1E1E2E', // Navy
    secondaryColor: '#FFFFFF', // White (was Yellow #FDE047)
    accentColor: '#e44598', // Pink (was Yellow #FDE047)
    backgroundColor: '#FFFFFF',
    textColor: '#1E1E2E',
    mutedTextColor: '#64748B',
    buttonStyle: 'filled',
    borderRadiusScale: 'medium',
    headingFont: 'Inter',
    bodyFont: 'Inter',
};

export async function getActiveTheme(): Promise<Theme> {
    try {
        const data = await fetchSanity(THEME_QUERY);
        const settingsTheme = data?.settings?.theme || {};
        const campaignTheme = data?.activeCampaign?.themeOverride || {};

        // Merge logic: Default -> Settings -> Campaign
        // Campaign takes highest precedence if active
        // 1. Merge raw objects first
        const rawMerged = {
            ...DEFAULT_THEME,
            ...removeEmpty(settingsTheme),
            ...removeEmpty(campaignTheme),
        };

        // 2. Normalize colors (handle string vs object.hex)
        const finalTheme: Theme = {
            ...rawMerged,
            primaryColor: normalizeColor(rawMerged.primaryColor) || DEFAULT_THEME.primaryColor,
            secondaryColor: normalizeColor(rawMerged.secondaryColor) || DEFAULT_THEME.secondaryColor,
            accentColor: normalizeColor(rawMerged.accentColor) || DEFAULT_THEME.accentColor,
            backgroundColor: normalizeColor(rawMerged.backgroundColor) || DEFAULT_THEME.backgroundColor,
            textColor: normalizeColor(rawMerged.textColor) || DEFAULT_THEME.textColor,
            mutedTextColor: normalizeColor(rawMerged.mutedTextColor) || DEFAULT_THEME.mutedTextColor,
        };

        return finalTheme;
    } catch (error) {
        console.error("Failed to resolve theme:", error);
        return DEFAULT_THEME;
    }
}

function removeEmpty(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined && v !== "")
    );
}

function normalizeColor(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.hex) return value.hex; // @sanity/color-input
    return undefined;
}
