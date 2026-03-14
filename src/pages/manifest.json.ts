import type { APIRoute } from "astro";
import { fetchGlobalSettings } from "../lib/siteSettings";

export const GET: APIRoute = async () => {
  const settings = await fetchGlobalSettings();
  const manifest = {
    name: settings.site_info?.title || "Amii",
    short_name: settings.site_info?.title || "Amii",
    description: settings.site_info?.description || "Amii Official Website",
    start_url: "/",
    display: "standalone",
    background_color: "#FDF38A",
    theme_color: "#15499D",
    icons: [] as { src: string; sizes: string; type: string; }[],
  };

  if (settings.favicons?.manifest192) {
    manifest.icons.push({
      src: settings.favicons.manifest192,
      sizes: "192x192",
      type: "image/png",
    });
  }

  if (settings.favicons?.manifest512) {
    manifest.icons.push({
      src: settings.favicons.manifest512,
      sizes: "512x512",
      type: "image/png",
    });
  }

  // Fallback if no icons set yet
  if (manifest.icons.length === 0) {
    manifest.icons.push({
      src: settings.site_info?.logo_navy || "/favicon.ico",
      sizes: "any",
      type: "image/x-icon"
    });
  }

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
