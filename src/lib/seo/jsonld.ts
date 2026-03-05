/**
 * JSON-LD structured data generators.
 * Import and use in page <head> for rich search results.
 */

export function musicGroupJsonLd(data: {
    name: string;
    url: string;
    image?: string;
    description?: string;
    genre?: string[];
    members?: { name: string; url?: string }[];
    sameAs?: string[];
}) {
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MusicGroup",
        name: data.name,
        url: data.url,
        image: data.image,
        description: data.description,
        genre: data.genre,
        member: data.members?.map((m) => ({
            "@type": "Person",
            name: m.name,
            url: m.url,
        })),
        sameAs: data.sameAs,
    });
}

export function musicAlbumJsonLd(data: {
    name: string;
    url: string;
    image?: string;
    datePublished?: string;
    artist: string;
    tracks?: { name: string; duration?: string }[];
}) {
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MusicAlbum",
        name: data.name,
        url: data.url,
        image: data.image,
        datePublished: data.datePublished,
        byArtist: { "@type": "MusicGroup", name: data.artist },
        track: data.tracks?.map((t) => ({
            "@type": "MusicRecording",
            name: t.name,
            duration: t.duration,
        })),
    });
}

export function eventJsonLd(data: {
    name: string;
    url?: string;
    startDate: string;
    endDate?: string;
    location: { name: string; address?: string };
    performer: string;
    ticketUrl?: string;
    status?: string;
}) {
    const statusMap: Record<string, string> = {
        announced: "https://schema.org/EventScheduled",
        onSale: "https://schema.org/EventScheduled",
        soldOut: "https://schema.org/EventScheduled",
        cancelled: "https://schema.org/EventCancelled",
        postponed: "https://schema.org/EventPostponed",
    };
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MusicEvent",
        name: data.name,
        url: data.url,
        startDate: data.startDate,
        endDate: data.endDate,
        eventStatus: statusMap[data.status || "announced"],
        location: {
            "@type": "Place",
            name: data.location.name,
            address: data.location.address,
        },
        performer: { "@type": "MusicGroup", name: data.performer },
        offers: data.ticketUrl
            ? { "@type": "Offer", url: data.ticketUrl }
            : undefined,
    });
}
