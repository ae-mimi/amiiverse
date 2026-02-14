/**
 * TypeScript interfaces for Sanity content.
 * These match the schema definitions in /schema.
 */

// ── Reusable objects ────────────────────────────────────

export interface SeoData {
    title?: string;
    description?: string;
    ogImage?: SanityImage;
    noIndex?: boolean;
    canonicalUrl?: string;
}

export interface LinkData {
    label?: string;
    type?: "internal" | "external" | "download" | "email" | "phone";
    internalRef?: { slug: { current: string } };
    url?: string;
    file?: SanityFile;
    newTab?: boolean;
}

export interface PlatformLinksData {
    spotify?: string;
    appleMusic?: string;
    youtubeMusic?: string;
    audiomack?: string;
    boomplay?: string;
    soundcloud?: string;
    deezer?: string;
    tidal?: string;
}

// ── Sanity primitives ───────────────────────────────────

export interface SanityImage {
    _type: "image";
    asset: { _ref: string; url?: string };
    hotspot?: { x: number; y: number; height: number; width: number };
    alt?: string;
    caption?: string;
}

export interface SanityFile {
    _type: "file";
    asset: { _ref: string; url?: string };
}

export interface SanitySlug {
    _type: "slug";
    current: string;
}

// ── Documents ───────────────────────────────────────────

export interface Release {
    _type: "release";
    title: string;
    slug: SanitySlug;
    releaseType: "single" | "ep" | "album";
    releaseDate: string;
    artwork?: SanityImage;
    platformLinks?: PlatformLinksData;
    smartLinkUrl?: string;
    preSaveUrl?: string;
    versions?: { label: string; platformLinks?: PlatformLinksData }[];
    tracklist?: Track[];
    story?: string;
    credits?: Credit[];
    lyricsHighlights?: { text: string; trackRef?: { title: string } }[];
    featuredVideo?: Video;
    gallery?: Gallery;
    seo?: SeoData;
}

export interface Track {
    _type: "track";
    title: string;
    slug: SanitySlug;
    release?: { title: string; slug: SanitySlug };
    trackNumber?: number;
    duration?: string;
    isSingleFocus?: boolean;
    previewUrl?: string;
    lyrics?: string;
    story?: string;
    credits?: Credit[];
    platformLinks?: PlatformLinksData;
}

export interface Credit {
    role: string;
    name: string;
}

export interface Video {
    _type: "video";
    title: string;
    slug: SanitySlug;
    videoType?: "musicVideo" | "performance" | "dancePractice" | "liveSession" | "teaser" | "shorts";
    release?: { title: string; slug: SanitySlug };
    youtubeUrl: string;
    embedUrl?: string;
    poster?: SanityImage;
    publishedAt?: string;
    description?: string;
    seo?: SeoData;
}

export interface Gallery {
    _type: "gallery";
    title: string;
    slug: SanitySlug;
    category?: string;
    items: { image: SanityImage; alt?: string; caption?: string; credit?: string }[];
}

export interface Member {
    _type: "member";
    name: string;
    slug: SanitySlug;
    role?: string;
    profilePhoto: SanityImage;
    emblem?: SanityImage;
    emblemMeaning?: string;
    virtues?: { title: string; whyItMatters?: string; howToLiveIt?: string }[];
    bioShort?: string;
    bioLong?: string;
    fact?: string;
    socials?: {
        instagram?: string;
        tiktok?: string;
        x?: string;
        youtube?: string;
        spotify?: string;
    };
}

export interface EventDoc {
    _type: "event";
    title: string;
    slug: SanitySlug;
    eventType?: "show" | "festival" | "appearance" | "meetup";
    startDateTime: string;
    endDateTime?: string;
    timezone?: string;
    venueName?: string;
    city?: string;
    country?: string;
    address?: string;
    mapUrl?: string;
    ticketUrl?: string;
    ticketProviders?: LinkData[];
    ageLimit?: string;
    status?: "announced" | "onSale" | "soldOut" | "cancelled" | "postponed";
    lineup?: string[];
    notes?: string;
    seo?: SeoData;
}

export interface PressMention {
    _type: "pressMention";
    title: string;
    publisher?: string;
    publishedDate?: string;
    url?: string;
    quote?: string;
    featured?: boolean;
}

export interface Post {
    _type: "post";
    title: string;
    slug: SanitySlug;
    category?: "announcement" | "behindTheScenes" | "press" | "community";
    publishedAt: string;
    coverImage?: SanityImage;
    excerpt?: string;
    content?: string;
    seo?: SeoData;
}

export interface DownloadableAsset {
    _type: "downloadableAsset";
    title: string;
    category?: "epk" | "logo" | "photo" | "rider" | "stagePlot" | "misc";
    file: SanityFile;
    fileUrl?: string;
    previewImage?: SanityImage;
    usageRights?: string;
}

export interface TimelineItem {
    _type: "timelineItem";
    title: string;
    date: string;
    description?: string;
    media?: SanityImage;
}

export interface FanSubmission {
    _type: "fanSubmission";
    displayName: string;
    location?: string;
    message: string;
    image?: SanityImage;
    type?: "message" | "fanArt" | "photo";
}

export interface Poll {
    _type: "poll";
    question: string;
    slug: SanitySlug;
    options?: string[];
    startDate?: string;
    endDate?: string;
    status?: "draft" | "live" | "closed";
}

// ── Page and sections ───────────────────────────────────

export interface Page {
    title: string;
    slug: SanitySlug;
    pageType?: string;
    seo?: SeoData;
    sections?: PageSection[];
}

/**
 * Discriminated union of all possible section types.
 * The `_type` field determines which properties are available.
 */
export type PageSection =
    | HeroSection
    | PredebutHeroSection
    | PageHeroSection
    | IntroSection
    | MediaTextSection
    | RichTextSection
    | GallerySection
    | VideoEmbedSection
    | CtaBannerSection
    | CountdownSection
    | FaqSection
    | TestimonialsSection
    | ReleaseSpotlightSection
    | DiscographyGridSection
    | SmartLinksSection
    | CreditsBlockSection
    | VideoGallerySection
    | ShortsWallSection
    | NewsFeedSection
    | TourDatesSection
    | MusicGridSection
    | MembersGridSection
    | ShopGridSection
    | PressGridSection
    | PressQuotesSection
    | DownloadsCenterSection
    | FanWallSection
    | PollBlockSection
    | EventsSection
    | TimelineSection
    | WidgetSection
    | EmailSignupSection
    | NewsletterSignupSection
    | ContactFormSection
    | ContactSectionBlock
    | SpacerSection
    | DividerSection
    | MarqueeSection
    | LyricHighlightSection
    | ProfileHeaderSection
    | LinkStackSection;

// ── Section interfaces ──────────────────────────────────

interface SectionBase {
    _key: string;
    [key: string]: any;
}

export interface HeroSection extends SectionBase { _type: "hero"; title: string; subtitle?: string; description?: string; image?: SanityImage; cta_primary?: string; cta_primary_link?: string; cta_secondary?: string; cta_secondary_link?: string; }
export interface PredebutHeroSection extends SectionBase { _type: "predebut_hero"; top_text?: string; image?: SanityImage; status_text?: string; cta_text?: string; cta_link?: string; }
export interface PageHeroSection extends SectionBase { _type: "page_hero"; title: string; subtitle?: string; }
export interface IntroSection extends SectionBase { _type: "intro"; heading?: string; content?: string; image?: SanityImage; }
export interface MediaTextSection extends SectionBase { _type: "media_text"; heading?: string; content?: string; image?: SanityImage; layout?: "imageLeft" | "imageRight"; }
export interface RichTextSection extends SectionBase { _type: "rich_text"; body?: string; }
export interface GallerySection extends SectionBase { _type: "gallery_block"; title?: string; images?: (SanityImage & { alt?: string; caption?: string })[]; columns?: number; }
export interface VideoEmbedSection extends SectionBase { _type: "video_embed"; title?: string; video_url: string; caption?: string; }
export interface CtaBannerSection extends SectionBase { _type: "cta_banner"; heading: string; description?: string; button_text: string; button_link: string; bg_image?: SanityImage; }
export interface CountdownSection extends SectionBase { _type: "countdown"; label: string; target_date: string; finished_text?: string; }
export interface FaqSection extends SectionBase { _type: "faq"; title?: string; items: { question: string; answer: string }[]; }
export interface TestimonialsSection extends SectionBase { _type: "testimonials"; title?: string; quotes: { quote: string; author?: string; source?: string }[]; }
export interface ReleaseSpotlightSection extends SectionBase { _type: "release_spotlight"; release?: Release; showTracklist?: boolean; showCredits?: boolean; showPreSave?: boolean; }
export interface DiscographyGridSection extends SectionBase { _type: "discography_grid"; title?: string; filtersEnabled?: boolean; defaultFilter?: string; }
export interface SmartLinksSection extends SectionBase { _type: "smart_links"; release?: { title: string; platformLinks?: PlatformLinksData; smartLinkUrl?: string }; }
export interface CreditsBlockSection extends SectionBase { _type: "credits_block"; release?: { title: string; credits?: Credit[] }; }
export interface VideoGallerySection extends SectionBase { _type: "video_gallery"; title?: string; videos?: Video[]; layout?: "grid" | "carousel"; }
export interface ShortsWallSection extends SectionBase { _type: "shorts_wall"; title?: string; embeds?: string[]; }
export interface NewsFeedSection extends SectionBase { _type: "news_feed"; title?: string; limit?: number; }
export interface TourDatesSection extends SectionBase { _type: "tour_dates"; title?: string; upcomingOnly?: boolean; showFilters?: boolean; }
export interface MusicGridSection extends SectionBase { _type: "music_grid"; title?: string; }
export interface MembersGridSection extends SectionBase { _type: "members_grid"; title?: string; members?: Member[]; }
export interface ShopGridSection extends SectionBase { _type: "shop_grid"; title?: string; limit?: number; }
export interface PressGridSection extends SectionBase { _type: "press_grid"; title?: string; }
export interface PressQuotesSection extends SectionBase { _type: "press_quotes"; title?: string; items?: PressMention[]; }
export interface DownloadsCenterSection extends SectionBase { _type: "downloads_center"; title?: string; assets?: DownloadableAsset[]; }
export interface FanWallSection extends SectionBase { _type: "fan_wall"; title?: string; submissionEnabled?: boolean; moderationNotice?: string; }
export interface PollBlockSection extends SectionBase { _type: "poll_block"; poll?: Poll; }
export interface EventsSection extends SectionBase { _type: "events"; title?: string; event_list?: any[]; }
export interface TimelineSection extends SectionBase { _type: "timeline"; title?: string; items?: TimelineItem[]; }
export interface WidgetSection extends SectionBase { _type: "widget"; widget_type?: string; music_item?: any; }
export interface EmailSignupSection extends SectionBase { _type: "email_signup"; title?: string; subtitle?: string; provider?: string; formId?: string; successMessage?: string; }
export interface NewsletterSignupSection extends SectionBase { _type: "newsletter_signup"; title?: string; subtitle?: string; buttonText?: string; successRedirect?: string; }
export interface ContactFormSection extends SectionBase { _type: "contact_form"; title?: string; endpoint?: string; }
export interface ContactSectionBlock extends SectionBase { _type: "contact_section"; title?: string; subtitle?: string; management_email?: string; press_email?: string; bookings_email?: string; inquiries_email?: string; show_socials?: boolean; }
export interface SpacerSection extends SectionBase { _type: "spacer"; size?: "sm" | "md" | "lg"; }
export interface DividerSection extends SectionBase { _type: "divider"; style?: string; width?: string; }
export interface MarqueeSection extends SectionBase { _type: "marquee"; text: string; speed?: string; variant?: string; }
export interface LyricHighlightSection extends SectionBase { _type: "lyric_highlight"; text: string; attribution?: string; alignment?: string; }
export interface ProfileHeaderSection extends SectionBase { _type: "profile_header"; name?: string; bio?: string; avatar?: SanityImage; }
export interface LinkStackSection extends SectionBase { _type: "link_stack"; links?: LinkData[]; }

// ── Settings ────────────────────────────────────────────

export interface SiteSettings {
    title: string;
    description?: string;
    keywords?: string[];
    defaultSeo?: SeoData;
    announcementBar?: {
        enabled?: boolean;
        text?: string;
        link?: LinkData;
        closable?: boolean;
    };
    logo_navy?: string;
    logo_yellow?: string;
    favicons?: {
        ico?: string;
        svg?: string;
        png96?: string;
        apple?: string;
        manifest192?: string;
        manifest512?: string;
    };
    enable_follow_link?: boolean;
    nav?: {
        label: string;
        href: string;
        is_special?: boolean;
        disabled?: boolean;
    }[];
    footer?: {
        copyright?: string;
        links?: {
            label: string;
            href: string;
            is_special?: boolean;
            disabled?: boolean;
        }[];
    };
    socials?: {
        platform: string;
        url: string;
        icon: string;
    }[];
    site_info?: {
        title: string;
        description: string;
        logo_navy?: string;
        logo_yellow?: string;
    };
}
