/// <reference types="astro/client" />

interface Window {
    netlifyIdentity: any;
    amiiAnalytics: {
        track: (category: string, action: string, label: string) => void;
    };
}
