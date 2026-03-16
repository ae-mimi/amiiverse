/**
 * GROQ queries for Sanity data.
 *
 * Convention: each export is a named constant ending in `_QUERY`.
 * Queries use the new `sections[]` field on `page`.
 */

// ── Pages ───────────────────────────────────────────────

/** Fetch a single page by slug, with all sections resolved. */
export const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]{
  title,
  slug,
  pageType,
  seo,
  sections[]{
    ...,
    _type == "widget" => {
      ...,
      music_item->{
        title,
        "cover": release->artwork,
        "performed_by": credits[role match "Performed by"][0].name,
        "lyrics": credits[role match "Written by" || role match "Lyrics"][0].name,
        "producer": credits[role match "Produced by" || role match "Prod."][0].name,
        "spotify": platformLinks.spotify,
        "apple_music": platformLinks.apple,
        "youtube_music": platformLinks.youtube,
        "audio_url": previewUrl
      }
    },
    _type == "release_spotlight" => {
      ...,
      release->{
        title, slug, releaseType, releaseDate, artwork,
        platformLinks, smartLinkUrl, preSaveUrl, story,
        credits,
        lyricsHighlights[]{ text, trackRef->{ title } },
        tracklist[]->{ title, slug, trackNumber, duration, isSingleFocus, platformLinks }
      }
    },
    _type == "video_gallery" => {
      ...,
      videos[]->{ title, slug, videoType, youtubeUrl, embedUrl, poster, publishedAt }
    },
    _type == "members_grid" => {
      ...,
      members[]->{ name, slug, role, profilePhoto, bioShort }
    },
    _type == "press_quotes" => {
      ...,
      items[]->{ title, publisher, publishedDate, url, quote, featured }
    },
    _type == "downloads_center" => {
      ...,
      assets[]->{ title, category, file, previewImage, usageRights }
    },
    _type == "timeline" => {
      ...,
      items[]->{ title, date, description, media }
    },
    _type == "smart_links" => {
      ...,
      release->{ title, platformLinks, smartLinkUrl }
    },
    _type == "credits_block" => {
      ...,
      release->{ title, credits }
    },
    _type == "poll_block" => {
      ...,
      poll->{ question, slug, options, voteCounts, startDate, endDate, status }
    }
  }
}`;

/** Fetch all page slugs (for static paths). */
export const ALL_PAGES_QUERY = `*[_type == "page"]{ "slug": slug.current }`;

// ── Settings ────────────────────────────────────────────

export const SETTINGS_QUERY = `*[_type == "settings" && _id == "settings"][0]{
  ...,
  "logo_navy": logo_navy.asset->url,
  "logo_yellow": logo_yellow.asset->url,
  "favicons": {
    "ico": favicons.ico.asset->url,
    "svg": favicons.svg.asset->url,
    "png96": favicons.png96.asset->url,
    "apple": favicons.apple.asset->url,
    "manifest192": favicons.manifest192.asset->url,
    "manifest512": favicons.manifest512.asset->url,
    "webmanifest": favicons.webmanifest.asset->url
  },
  "seo": {
    "meta_title": defaultSeo.metaTitle,
    "meta_description": defaultSeo.metaDescription,
    "og_image": defaultSeo.shareImage.asset->url
  },
  announcementBar{
    ...,
    link{ label, type, url, internalRef->{ slug } }
  },
  shop{
    deliveryOptions[]{
      code,
      label,
      priceNgn,
      estimate,
      description,
      isDefault
    }
  },
  "site_info": {
    "title": title,
    "description": description,
    "logo_navy": logo_navy.asset->url,
    "logo_yellow": logo_yellow.asset->url
  },
  "navigationItems": navigationItems[]{
    showInHeader,
    showInFooter,
    is_special,
    disabled,
    link{ 
      label, 
      type, 
      url, 
      internalRef->{ "slug": slug.current } 
    }
  },
  "footer": {
    "businessName": footer.businessName,
    "contactEmail": footer.contactEmail,
    "copyright": footer.copyright
  }
}`;

export const ACTIVE_CAMPAIGN_LOGO_OVERRIDE_QUERY = `*[
  _type == "campaign" &&
  status == "live" &&
  (!defined(startDate) || startDate <= now()) &&
  (!defined(endDate) || endDate >= now())
][0]{
  "logo_navy": coalesce(branding.logo_navy.asset->url, themeOverride.logo_navy.asset->url),
  "logo_yellow": coalesce(branding.logo_yellow.asset->url, themeOverride.logo_yellow.asset->url)
}`;

export const ACTIVE_CAMPAIGN_FAVICON_OVERRIDE_QUERY = `*[
  _type == "campaign" &&
  status == "live" &&
  (!defined(startDate) || startDate <= now()) &&
  (!defined(endDate) || endDate >= now())
][0]{
  "favicons": {
    "ico": branding.favicons.ico.asset->url,
    "svg": branding.favicons.svg.asset->url,
    "png96": branding.favicons.png96.asset->url,
    "apple": branding.favicons.apple.asset->url,
    "manifest192": branding.favicons.manifest192.asset->url,
    "manifest512": branding.favicons.manifest512.asset->url,
    "webmanifest": branding.favicons.webmanifest.asset->url
  }
}`;

// ── Releases ────────────────────────────────────────────

export const ALL_RELEASES_QUERY = `*[_type == "release"] | order(releaseDate desc) {
  title, slug, releaseType, releaseDate, artwork, platformLinks, smartLinkUrl
}`;

export const RELEASE_QUERY = `*[_type == "release" && slug.current == $slug][0]{
  ...,
  tracklist[]->{ title, slug, trackNumber, duration, isSingleFocus, platformLinks, lyrics, credits },
  featuredVideo->{ title, youtubeUrl, poster },
  gallery->{ title, items[]{ image, alt, caption, credit } },
  seo
}`;

// ── Videos ──────────────────────────────────────────────

export const ALL_VIDEOS_QUERY = `*[_type == "video"] | order(publishedAt desc) {
  title, slug, videoType, youtubeUrl, poster, publishedAt,
  release->{ title, slug }
}`;

// ── Events ──────────────────────────────────────────────

export const ALL_EVENTS_QUERY = `*[_type == "event"] | order(startDateTime asc) {
  title, slug, eventType, startDateTime, endDateTime,
  venueName, city, country, ticketUrl, status
}`;

export const UPCOMING_EVENTS_QUERY = `*[_type == "event" && startDateTime >= now()] | order(startDateTime asc) {
  title, slug, eventType, startDateTime, endDateTime,
  venueName, city, country, ticketUrl, status
}`;

// ── Members ─────────────────────────────────────────────

export const ALL_MEMBERS_QUERY = `*[_type == "member"] | order(_createdAt asc) {
  name, slug, role, profilePhoto, bioShort, emblem, socials
}`;

export const MEMBER_QUERY = `*[_type == "member" && slug.current == $slug][0]{
  ...,
  virtues[]{ title, whyItMatters, howToLiveIt }
}`;

// ── Press ───────────────────────────────────────────────

export const ALL_PRESS_QUERY = `*[_type == "pressMention"] | order(publishedDate desc) {
  title, publisher, publishedDate, url, quote, featured
}`;

export const FEATURED_PRESS_QUERY = `*[_type == "pressMention" && featured == true] | order(publishedDate desc) {
  title, publisher, publishedDate, url, quote
}`;

// ── Posts ────────────────────────────────────────────────

export const ALL_POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  title, slug, category, publishedAt, coverImage, excerpt
}`;

export const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  ..., seo
}`;

// ── Downloads ───────────────────────────────────────────

export const ALL_DOWNLOADS_QUERY = `*[_type == "downloadableAsset"] | order(_createdAt desc) {
  title, category, "fileUrl": file.asset->url, previewImage, usageRights
}`;

// ── Fan Submissions ─────────────────────────────────────

export const APPROVED_FANS_QUERY = `*[_type == "fanSubmission" && status == "approved"] | order(submittedAt desc) {
  displayName, location, message, image, type
}`;

// ── Timeline ────────────────────────────────────────────
export const ALL_TIMELINE_QUERY = `*[_type == "timelineItem"] | order(date asc) {
  title, date, description, media
}`;

