import { fetchSanity } from "./sanity/client";
import { THEME_QUERY } from "./sanity/themeQueries";

export interface Theme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    mutedTextColor: string;
    buttonBgColor: string;
    buttonTextColor: string;
    inputBorderColor: string;
    inputTextColor: string;
    linkTextColor: string;
    underlineColor: string;
    buttonStyle: "filled" | "outline" | "ghost";
    borderRadiusScale: "small" | "medium" | "large";
    headingFont: string;
    bodyFont: string;
}

type CustomPaletteTarget =
    | "buttonBg"
    | "buttonText"
    | "inputBorder"
    | "inputText"
    | "linkText"
    | "underline";

const DEFAULT_THEME: Theme = {
    primaryColor: '#1E1E2E', // Navy
    secondaryColor: '#FFFFFF', // White (was Yellow #FDE047)
    accentColor: '#e44598', // Pink (was Yellow #FDE047)
    backgroundColor: '#FFFFFF',
    textColor: '#1E1E2E',
    mutedTextColor: '#64748B',
    buttonBgColor: '#1E1E2E',
    buttonTextColor: '#FFFFFF',
    inputBorderColor: '#1E1E2E',
    inputTextColor: '#1E1E2E',
    linkTextColor: '#1E1E2E',
    underlineColor: '#1E1E2E',
    buttonStyle: 'filled',
    borderRadiusScale: 'medium',
    headingFont: 'Starbim',
    bodyFont: 'Archivo',
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

        const customPaletteOverrides = {
            ...getCustomPaletteOverrides(settingsTheme?.customPalette),
            ...getCustomPaletteOverrides(campaignTheme?.customPalette),
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
            buttonBgColor:
                customPaletteOverrides.buttonBg ||
                normalizeColor(rawMerged.buttonBgColor) ||
                normalizeColor(rawMerged.primaryColor) ||
                DEFAULT_THEME.buttonBgColor,
            buttonTextColor:
                customPaletteOverrides.buttonText ||
                normalizeColor(rawMerged.buttonTextColor) ||
                normalizeColor(rawMerged.secondaryColor) ||
                DEFAULT_THEME.buttonTextColor,
            inputBorderColor:
                customPaletteOverrides.inputBorder ||
                normalizeColor(rawMerged.inputBorderColor) ||
                normalizeColor(rawMerged.primaryColor) ||
                DEFAULT_THEME.inputBorderColor,
            inputTextColor:
                customPaletteOverrides.inputText ||
                normalizeColor(rawMerged.inputTextColor) ||
                normalizeColor(rawMerged.textColor) ||
                DEFAULT_THEME.inputTextColor,
            linkTextColor:
                customPaletteOverrides.linkText ||
                normalizeColor(rawMerged.linkTextColor) ||
                normalizeColor(rawMerged.primaryColor) ||
                DEFAULT_THEME.linkTextColor,
            underlineColor:
                customPaletteOverrides.underline ||
                normalizeColor(rawMerged.underlineColor) ||
                normalizeColor(rawMerged.primaryColor) ||
                DEFAULT_THEME.underlineColor,
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

function getCustomPaletteOverrides(
    customPalette: unknown,
): Partial<Record<CustomPaletteTarget, string>> {
    if (!Array.isArray(customPalette)) return {};

    return customPalette.reduce((acc, item) => {
        const target = typeof item?.target === "string" ? item.target : undefined;
        const color = normalizeColor(item?.color);
        if (!target || !color) return acc;
        if (isCustomPaletteTarget(target)) {
            acc[target] = color;
        }
        return acc;
    }, {} as Partial<Record<CustomPaletteTarget, string>>);
}

function isCustomPaletteTarget(value: string): value is CustomPaletteTarget {
    return (
        value === "buttonBg" ||
        value === "buttonText" ||
        value === "inputBorder" ||
        value === "inputText" ||
        value === "linkText" ||
        value === "underline"
    );
}
