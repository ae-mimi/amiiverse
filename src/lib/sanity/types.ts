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
    fileUrl?: string;
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
    visibility?: "draft" | "public" | "archived";
    era?: string;
    eventDate?: string;
    campaign?: { title?: string; slug?: SanitySlug };
    items: {
        image: SanityImage;
        alt?: string;
        caption?: string;
        credit?: string;
        visibility?: "draft" | "public" | "archived";
        featured?: boolean;
        date?: string;
        era?: string;
        campaign?: { title?: string; slug?: SanitySlug };
        members?: { name?: string; slug?: SanitySlug }[];
    }[];
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
export type ImageDisplayStyle = "boxed" | "fullWidthBleed" | "fullScreen" | "split" | "asymmetric" | "fixedBackground";

export interface ImageEditorOptions {
    imageDisplayStyle?: ImageDisplayStyle;
    useBackgroundRemovedImage?: boolean;
    backgroundRemovedImage?: SanityImage;
    imageObjectPosition?: string;
    imageRotate?: number;
    imageFlipHorizontal?: boolean;
    imageFlipVertical?: boolean;
    imageSkewX?: number;
    imageSkewY?: number;
    imageFilterPreset?: string;
    imageBrightness?: number;
    imageExposure?: number;
    imageContrast?: number;
    imageSaturation?: number;
    imageWarmth?: number;
    imageTint?: number;
    imageSharpness?: number;
    imageVignette?: number;
    imageOverlayColor?: string;
    imageOverlayOpacity?: number;
    imageMarkupText?: string;
}

export interface Achievement {
    _type: "achievement";
    title: string;
    category?: "milestone" | "award" | "stat" | "media" | "other";
    date?: string;
    description?: string;
    metric?: string;
    url?: string;
    featured?: boolean;
}

export interface EpkProfile {
    _type: "epkProfile";
    title: string;
    shortBio?: string;
    longBio?: string;
    keyFacts?: { label?: string; value?: string }[];
    contacts?: {
        managementEmail?: string;
        pressEmail?: string;
        bookingsEmail?: string;
        inquiriesEmail?: string;
    };
    featuredReleases?: Release[];
    featuredVideos?: Video[];
    featuredAssets?: DownloadableAsset[];
    featuredPress?: PressMention[];
    featuredAchievements?: Achievement[];
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
    category?: "epkPdf" | "bioPdf" | "pressPhoto" | "albumArt" | "logo" | "rider" | "stagePlot" | "promoClip" | "misc" | "epk" | "photo";
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
    | SectionTabsSection
    | IntroSection
    | MediaTextSection
    | RichTextSection
    | GallerySection
    | LibraryGallerySection
    | VideoEmbedSection
    | CtaBannerSection
    | LinkButtonsSection
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
    | PressGridSection
    | PressQuotesSection
    | DownloadsCenterSection
    | AchievementsBlockSection
    | PressKitSection
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

export interface HeroSection extends SectionBase, ImageEditorOptions { _type: "hero"; title: string; subtitle?: string; description?: string; image?: SanityImage; mediaWidth?: MediaWidth; imageCropPreset?: ImageCropPreset; imageDisplayStyle?: ImageDisplayStyle; contentOrder?: ("image" | "title" | "subtitle" | "description" | "buttons")[]; cta_primary?: string; cta_primary_link?: string; cta_secondary?: string; cta_secondary_link?: string; }
export interface PredebutHeroSection extends SectionBase, ImageEditorOptions { _type: "predebut_hero"; top_text?: string; image?: SanityImage; mediaWidth?: MediaWidth; imageCropPreset?: ImageCropPreset; contentOrder?: ("topText" | "image" | "banner")[]; status_text?: string; cta_text?: string; cta_link?: string; }
export interface PageHeroSection extends SectionBase { _type: "page_hero"; title: string; subtitle?: string; }
export interface SectionTabsSection extends SectionBase { _type: "section_tabs"; items?: { label?: string; targetId?: string }[]; }
export interface IntroSection extends SectionBase, ImageEditorOptions { _type: "intro"; heading?: string; content?: string; image?: SanityImage; imageCropPreset?: ImageCropPreset; epkProfile?: EpkProfile; bioVariant?: "short" | "long"; }
export interface MediaTextSection extends SectionBase, ImageEditorOptions { _type: "media_text"; heading?: string; content?: string; image?: SanityImage; layout?: "imageLeft" | "imageRight" | "imageTop" | "imageBottom"; mediaWidth?: MediaWidth; imageCropPreset?: ImageCropPreset; }
export interface RichTextSection extends SectionBase { _type: "rich_text"; body?: string; }
export interface GallerySection extends SectionBase, ImageEditorOptions { _type: "gallery_block"; title?: string; images?: (SanityImage & { alt?: string; caption?: string })[]; columns?: number; mediaWidth?: MediaWidth; imageCropPreset?: ImageCropPreset; teaserLimit?: number; showGalleryLink?: boolean; galleryLinkText?: string; }
export interface LibraryGallerySection extends SectionBase, ImageEditorOptions { _type: "library_gallery"; title?: string; gallery?: Gallery; columns?: 2 | 3 | 4; mediaWidth?: MediaWidth; imageCropPreset?: ImageCropPreset; teaserLimit?: number; showGalleryLink?: boolean; galleryLinkText?: string; }
export interface VideoEmbedSection extends SectionBase { _type: "video_embed"; title?: string; video_url: string; caption?: string; }
export interface CtaBannerSection extends SectionBase, ImageEditorOptions { _type: "cta_banner"; heading: string; description?: string; button_text: string; button_link: string; bg_image?: SanityImage; mediaWidth?: MediaWidth; imageCropPreset?: ImageCropPreset; }
export interface LinkButtonsSection extends SectionBase { _type: "link_buttons"; title?: string; intro?: string; links?: LinkData[]; layout?: "row" | "stack"; }
export interface CountdownSection extends SectionBase { _type: "countdown"; label: string; target_date: string; finished_text?: string; }
export interface FaqSection extends SectionBase { _type: "faq"; title?: string; items: { question: string; answer: string }[]; }
export interface TestimonialsSection extends SectionBase { _type: "testimonials"; title?: string; quotes: { quote: string; author?: string; source?: string }[]; }
export interface ReleaseSpotlightSection extends SectionBase { _type: "release_spotlight"; release?: Release; showTracklist?: boolean; showCredits?: boolean; showPreSave?: boolean; }
export interface DiscographyGridSection extends SectionBase { _type: "discography_grid"; title?: string; filtersEnabled?: boolean; defaultFilter?: string; }
export interface SmartLinksSection extends SectionBase { _type: "smart_links"; release?: { title: string; platformLinks?: PlatformLinksData; smartLinkUrl?: string }; buttonStyle?: "filled" | "outline" | "soft"; buttonShape?: "rounded" | "pill" | "square"; showUniversalLink?: boolean; universalLinkLabel?: string; }
export interface CreditsBlockSection extends SectionBase { _type: "credits_block"; release?: { title: string; credits?: Credit[] }; }
export interface VideoGallerySection extends SectionBase { _type: "video_gallery"; title?: string; videos?: Video[]; epkProfile?: EpkProfile; layout?: "grid" | "carousel"; showCopyActions?: boolean; mediaWidth?: MediaWidth; }
export interface ShortsWallSection extends SectionBase { _type: "shorts_wall"; title?: string; embeds?: string[]; }
export interface NewsFeedSection extends SectionBase { _type: "news_feed"; title?: string; limit?: number; }
export interface TourDatesSection extends SectionBase { _type: "tour_dates"; title?: string; upcomingOnly?: boolean; showFilters?: boolean; }
export interface MusicGridSection extends SectionBase { _type: "music_grid"; title?: string; }
export interface MembersGridSection extends SectionBase, ImageEditorOptions { _type: "members_grid"; title?: string; members?: Member[]; imageCropPreset?: ImageCropPreset; }
export interface PressGridSection extends SectionBase { _type: "press_grid"; title?: string; }
export interface PressQuotesSection extends SectionBase { _type: "press_quotes"; title?: string; items?: PressMention[]; epkProfile?: EpkProfile; }
export interface DownloadsCenterSection extends SectionBase { _type: "downloads_center"; title?: string; assets?: DownloadableAsset[]; epkProfile?: EpkProfile; showCategoryFilters?: boolean; mediaWidth?: MediaWidth; visibleCategories?: DownloadableAsset["category"][]; }
export interface AchievementsBlockSection extends SectionBase { _type: "achievements_block"; title?: string; items?: Achievement[]; epkProfile?: EpkProfile; }
export interface PressKitSection extends SectionBase {
    _type: "press_kit";
    layoutPreset?: "cardsLeft" | "mediaLeft";
    bioHeading?: string;
    bioText?: string;
    facts?: { label?: string; value?: string }[];
    links?: { label?: string; url?: string; icon?: string }[];
    mediaHeading?: string;
    downloads?: { label?: string; url?: string; asset?: DownloadableAsset }[];
    mediaItems?: { title?: string; image?: SanityImage; asset?: DownloadableAsset }[];
}
export interface FanWallSection extends SectionBase { _type: "fan_wall"; title?: string; submissionEnabled?: boolean; moderationNotice?: string; }
export interface PollBlockSection extends SectionBase { _type: "poll_block"; poll?: Poll; }
export interface EventsSection extends SectionBase { _type: "events"; title?: string; event_list?: any[]; }
export interface TimelineSection extends SectionBase { _type: "timeline"; title?: string; items?: TimelineItem[]; }
export interface WidgetSection extends SectionBase { _type: "widget"; widget_type?: string; music_item?: any; }
export interface EmailSignupSection extends SectionBase { _type: "email_signup"; title?: string; subtitle?: string; provider?: string; formId?: string; successMessage?: string; }
export interface NewsletterSignupSection extends SectionBase { _type: "newsletter_signup"; title?: string; subtitle?: string; buttonText?: string; successRedirect?: string; }
export interface ContactFormSection extends SectionBase { _type: "contact_form"; title?: string; }
export interface ContactSectionBlock extends SectionBase { _type: "contact_section"; title?: string; subtitle?: string; epkProfile?: EpkProfile; management_email?: string; press_email?: string; bookings_email?: string; inquiries_email?: string; show_socials?: boolean; }
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
        webmanifest?: string;
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
