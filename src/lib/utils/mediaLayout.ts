export type ImageCropPreset =
    | "natural"
    | "original"
    | "square"
    | "portrait916"
    | "portrait45"
    | "landscape54"
    | "portrait34"
    | "landscape43"
    | "portrait23"
    | "landscape32"
    | "portrait57"
    | "landscape75"
    | "portrait12"
    | "landscape21"
    | "panorama"
    | "story916"
    | "wide169"
    | "cinematic219"
    | "banner31";

export type MediaWidth = "contained" | "wide" | "full";
export type ImageDisplayStyle =
    | "boxed"
    | "fullWidthBleed"
    | "fullScreen"
    | "split"
    | "asymmetric"
    | "fixedBackground";

export function cropPresetToAspectRatio(preset?: ImageCropPreset): string | undefined {
    const ratios: Record<ImageCropPreset, string | undefined> = {
        natural: undefined,
        original: undefined,
        square: "1 / 1",
        portrait916: "9 / 16",
        portrait45: "4 / 5",
        landscape54: "5 / 4",
        portrait34: "3 / 4",
        landscape43: "4 / 3",
        portrait23: "2 / 3",
        landscape32: "3 / 2",
        portrait57: "5 / 7",
        landscape75: "7 / 5",
        portrait12: "1 / 2",
        landscape21: "2 / 1",
        panorama: "3 / 1",
        story916: "9 / 16",
        wide169: "16 / 9",
        cinematic219: "21 / 9",
        banner31: "3 / 1",
    };

    return ratios[preset || "natural"];
}

export function mediaWidthClass(baseClass: string, width?: MediaWidth): string {
    return `${baseClass} ${baseClass}--${width || "contained"}`;
}

export function imageLayoutClass(baseClass: string, style?: ImageDisplayStyle): string {
    return `${baseClass} ${baseClass}--${style || "boxed"}`;
}

export function resolveImageSource(image: any, fallbackImage?: any, useFallback?: boolean): any {
    return useFallback && fallbackImage ? fallbackImage : image;
}

export function imageEditStyleVars(settings: Record<string, any> = {}): string {
    const rotate = Number(settings.imageRotate || 0);
    const skewX = Number(settings.imageSkewX || 0);
    const skewY = Number(settings.imageSkewY || 0);
    const flipX = settings.imageFlipHorizontal ? -1 : 1;
    const flipY = settings.imageFlipVertical ? -1 : 1;

    const brightness =
        100 + Number(settings.imageBrightness || 0) + Number(settings.imageExposure || 0);
    const contrast = 100 + Number(settings.imageContrast || 0);
    const saturation = 100 + Number(settings.imageSaturation || 0);
    const warmth = Number(settings.imageWarmth || 0);
    const tint = Number(settings.imageTint || 0);
    const sharpness = Number(settings.imageSharpness || 0);
    const vignette = Math.max(0, Number(settings.imageVignette || 0));
    const filterPreset = filterPresetToCss(settings.imageFilterPreset);

    const transform = `rotate(${rotate}deg) scale(${flipX}, ${flipY}) skew(${skewX}deg, ${skewY}deg)`;
    const filter = [
        `brightness(${Math.max(0, brightness)}%)`,
        `contrast(${Math.max(0, contrast)}%)`,
        `saturate(${Math.max(0, saturation)}%)`,
        warmth ? `sepia(${Math.max(0, warmth / 3)}%)` : "",
        tint ? `hue-rotate(${tint}deg)` : "",
        sharpness < 0 ? `blur(${Math.abs(sharpness) / 50}px)` : "",
        filterPreset,
    ].filter(Boolean).join(" ");

    const overlayOpacity = Math.min(1, Math.max(0, Number(settings.imageOverlayOpacity || 0) / 100));
    const overlayColor = settings.imageOverlayColor || "#000000";
    const objectPosition = settings.imageObjectPosition || "center center";
    const frameShape = settings.imageFrameShape || "none";
    const frameRadius = frameShapeToRadius(frameShape);
    const frameBorderWidth = Math.max(0, Number(settings.imageFrameBorderWidth || 0));
    const frameBorderColor = settings.imageFrameBorderColor || "transparent";
    const framePadding = Math.max(0, Number(settings.imageFramePadding || 0));
    const frameBackgroundColor = settings.imageFrameBackgroundColor || "transparent";
    const frameShadow = frameShadowToCss(settings.imageFrameShadow);

    return [
        `--image-transform: ${transform}`,
        `--image-filter: ${filter}`,
        `--image-overlay-color: ${overlayColor}`,
        `--image-overlay-opacity: ${overlayOpacity}`,
        `--image-vignette-opacity: ${Math.min(0.85, vignette / 100)}`,
        `--image-object-position: ${objectPosition}`,
        `--image-frame-radius: ${frameRadius}`,
        `--image-frame-border-width: ${frameBorderWidth}px`,
        `--image-frame-border-color: ${frameBorderColor}`,
        `--image-frame-padding: ${framePadding}px`,
        `--image-frame-background: ${frameBackgroundColor}`,
        `--image-frame-shadow: ${frameShadow}`,
    ].join("; ");
}

function filterPresetToCss(preset?: string): string {
    const presets: Record<string, string> = {
        original: "",
        punch: "contrast(112%) saturate(118%)",
        golden: "sepia(18%) saturate(118%) brightness(104%)",
        radiate: "brightness(106%) saturate(125%)",
        warmContrast: "sepia(12%) contrast(112%) saturate(110%)",
        calm: "saturate(88%) brightness(104%)",
        coolLight: "hue-rotate(8deg) brightness(106%) saturate(92%)",
        vividCool: "hue-rotate(12deg) contrast(110%) saturate(125%)",
        dramaticCool: "hue-rotate(16deg) contrast(126%) saturate(96%) brightness(92%)",
        blackAndWhite: "grayscale(100%) contrast(108%)",
        sepia: "sepia(75%) contrast(104%)",
    };

    return presets[preset || "original"] || "";
}

function frameShapeToRadius(shape?: string): string {
    const shapes: Record<string, string> = {
        none: "0",
        rounded: "24px",
        softRounded: "48px",
        pill: "999px",
        circle: "50%",
        oval: "50%",
        arch: "999px 999px 32px 32px",
        card: "24px",
    };

    return shapes[shape || "none"] || shapes.none;
}

function frameShadowToCss(shadow?: string): string {
    const shadows: Record<string, string> = {
        none: "none",
        soft: "0 12px 28px rgba(0, 0, 0, 0.18)",
        lifted: "0 18px 40px rgba(0, 0, 0, 0.28)",
        glow: "0 0 0 3px rgba(255, 255, 255, 0.35), 0 16px 36px rgba(0, 0, 0, 0.22)",
    };

    return shadows[shadow || "none"] || shadows.none;
}
