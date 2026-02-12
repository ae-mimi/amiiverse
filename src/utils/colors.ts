/**
 * Generates a color ramp based on the user's "Gradient Stop Technique"
 * 
 * Logic:
 * 500: Base Color
 * 100: Mix(Base, White, 80%)  -> Lightest (User said 0% stop)
 * 900: Mix(Base, Black, 80%)  -> Darkest (User said 100% stop)
 * 
 * Interpolation:
 * 200, 300, 400 interpolate between 100 and 500
 * 600, 700, 800 interpolate between 500 and 900
 */

function hexToRgb(hex: string) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

function mix(color1: string, color2: string, weight: number): string {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    // Linear interpolation
    const r = c1.r * (1 - weight) + c2.r * weight;
    const g = c1.g * (1 - weight) + c2.g * weight;
    const b = c1.b * (1 - weight) + c2.b * weight;

    return rgbToHex(r, g, b);
}

export function generateRamp(baseHex: string) {
    if (!baseHex || !/^#[0-9A-F]{6}$/i.test(baseHex)) return null;

    const white = "#FFFFFF";
    const black = "#000000";

    // 1. Define Extremes based on user's logic (mixed with white/black)
    // "Turn darker/lighter to 100%/0%"
    // Let's assume the "Darker" was 50% mixed with black, and "Lighter" was 50% mixed with white?
    // User said: "Turn this Darker colour to white... switch position with base".
    // Figma default gradient is linear.
    // Let's try to approximate a nice range.
    const lightest = mix(baseHex, white, 0.9); // 100 (Nearly white)
    const darkest = mix(baseHex, black, 0.8);  // 900 (Nearly black)

    // 2. Interpolate
    return {
        100: lightest,
        200: mix(lightest, baseHex, 0.25),
        300: mix(lightest, baseHex, 0.50),
        400: mix(lightest, baseHex, 0.75),
        500: baseHex,
        600: mix(baseHex, darkest, 0.25),
        700: mix(baseHex, darkest, 0.50),
        800: mix(baseHex, darkest, 0.75),
        900: darkest
    };
}
