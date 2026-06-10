export type MediaWidth = "contained" | "wide" | "full";

export function mediaWidthClass(baseClass: string, width?: MediaWidth): string {
    return `${baseClass} ${baseClass}--${width || "contained"}`;
}
