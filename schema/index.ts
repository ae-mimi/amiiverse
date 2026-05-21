// ── Reusable objects ────────────────────────────────────
import seo from './objects/seo'
import link from './objects/link'
import platformLinks from './objects/platformLinks'
import navItem from './objects/navItem'
import navGroup from './objects/navGroup'
import themeSettings from './objects/themeSettings'
import { color, hslaColor, hsvaColor, rgbaColor } from '@sanity/color-input'

// ── Legacy schemas (kept for build) ─────────────────────
import linkStack from './linkStack'
import profileHeader from './profileHeader'

// ── Document schemas ────────────────────────────────────
import page from './page'
import settings from './settings'
import member from './member'
import release from './documents/release'
import track from './documents/track'
import video from './documents/video'
import gallery from './documents/gallery'
import event from './documents/event'
import post from './documents/post'
import downloadableAsset from './documents/downloadableAsset'
import timelineItem from './documents/timelineItem'
import fanSubmission from './documents/fanSubmission'
import poll from './documents/poll'
import campaign from './documents/campaign'
import redirect from './documents/redirect'
import pressMention from './documents/pressMention'
import achievement from './documents/achievement'
import epkProfile from './documents/epkProfile'

export const schemaTypes = [
    // Color input schema types (explicit registration)
    color,
    hslaColor,
    hsvaColor,
    rgbaColor,

    // Objects (must come first — used by documents)
    seo,
    link,
    platformLinks,
    navItem,
    navGroup,

    // Settings & Pages
    settings,
    page,

    // Music & Media
    release,
    track,
    video,
    gallery,

    // People & Events
    member,
    event,

    // Press & Downloads
    epkProfile,
    achievement,
    pressMention,
    downloadableAsset,

    // Community & Engagement
    post,
    fanSubmission,
    poll,

    // Campaigns & Admin
    campaign,
    redirect,
    timelineItem,

    // Legacy (kept for backward-compat build)
    linkStack,
    profileHeader,

    // New objects
    themeSettings,

]
