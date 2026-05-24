export type ImageCropPreset =
    | "natural"
    | "square"
    | "portrait45"
    | "portrait34"
    | "story916"
    | "landscape43"
    | "wide169"
    | "cinematic219"
    | "banner31";

export type MediaWidth = "contained" | "wide" | "full";

export function cropPresetToAspectRatio(preset?: ImageCropPreset): string | undefined {
    const ratios: Record<ImageCropPreset, string | undefined> = {
        natural: undefined,
        square: "1 / 1",
        portrait45: "4 / 5",
        portrait34: "3 / 4",
        story916: "9 / 16",
        landscape43: "4 / 3",
        wide169: "16 / 9",
        cinematic219: "21 / 9",
        banner31: "3 / 1",
    };

    return ratios[preset || "natural"];
}

export function mediaWidthClass(baseClass: string, width?: MediaWidth): string {
    return `${baseClass} ${baseClass}--${width || "contained"}`;
}
