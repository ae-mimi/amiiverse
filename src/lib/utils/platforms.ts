/**
 * Streaming platform labels, icons, and URL helpers.
 */

export interface PlatformInfo {
    label: string;
    icon: string; // simple-icons icon name
    color: string;
}

export const PLATFORMS: Record<string, PlatformInfo> = {
    spotify: { label: "Spotify", icon: "simple-icons:spotify", color: "#1DB954" },
    appleMusic: { label: "Apple Music", icon: "simple-icons:applemusic", color: "#FC3C44" },
    youtubeMusic: { label: "YouTube Music", icon: "simple-icons:youtubemusic", color: "#FF0000" },
    audiomack: { label: "Audiomack", icon: "simple-icons:audiomack", color: "#FFA500" },
    boomplay: { label: "Boomplay", icon: "simple-icons:boomplay", color: "#F5A623" },
    soundcloud: { label: "SoundCloud", icon: "simple-icons:soundcloud", color: "#FF5500" },
    deezer: { label: "Deezer", icon: "simple-icons:deezer", color: "#FEAA2D" },
    tidal: { label: "Tidal", icon: "simple-icons:tidal", color: "#000000" },
};

/**
 * Given a platformLinks object, return an array of { key, url, ...info }
 * for only the platforms that have URLs set.
 */
export function getActivePlatforms(
    links: Record<string, string | undefined> | undefined,
): { key: string; url: string; label: string; icon: string; color: string }[] {
    if (!links) return [];
    return Object.entries(links)
        .filter(([key, url]) => key in PLATFORMS && typeof url === "string" && /^https?:\/\//i.test(url))
        .map(([key, url]) => ({
            key,
            url: url!,
            ...PLATFORMS[key],
        }));
}
