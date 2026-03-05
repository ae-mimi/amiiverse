/**
 * Lucide icons for Sanity Studio schemas.
 * Uses @iconify/react + @iconify-json/lucide (already installed).
 */
import React from 'react'
import { Icon } from '@iconify/react'

/** Helper: creates a Sanity-compatible icon component from a Lucide icon name */
function lucide(name: string) {
    return function LucideIcon() {
        return React.createElement(Icon, { icon: `lucide:${name}`, width: 18, height: 18 })
    }
}

// ── Document types ──────────────────────────────────────
export const PageIcon = lucide('file-text')
export const SettingsIcon = lucide('settings')
export const MusicIcon = lucide('disc-3')
export const MemberIcon = lucide('users')
export const ShopIcon = lucide('shopping-bag')
export const PressIcon = lucide('newspaper')
export const ThemeIcon = lucide('palette')
export const ReleaseIcon = lucide('disc-3')
export const TrackIcon = lucide('music')
export const VideoDocIcon = lucide('clapperboard')
export const GalleryDocIcon = lucide('images')
export const EventIcon = lucide('calendar-days')
export const PostIcon = lucide('rss')
export const DownloadIcon = lucide('download')
export const TimelineIcon = lucide('milestone')
export const FanIcon = lucide('heart-handshake')
export const PollIcon = lucide('bar-chart-3')
export const CampaignIcon = lucide('rocket')
export const RedirectIcon = lucide('arrow-right-left')
export const PressMentionIcon = lucide('newspaper')

// ── Block icons ─────────────────────────────────────────
// Heroes
export const HeroHomeIcon = lucide('layout-dashboard')
export const HeroPredebutIcon = lucide('hourglass')
export const HeroPageIcon = lucide('type')

// Content
export const IntroIcon = lucide('sparkles')
export const RichTextIcon = lucide('text')
export const GalleryIcon = lucide('images')
export const VideoIcon = lucide('play-circle')

// Engagement
export const CTAIcon = lucide('megaphone')
export const CountdownIcon = lucide('timer')
export const FAQIcon = lucide('help-circle')
export const TestimonialIcon = lucide('quote')

// Collections
export const MusicGridIcon = lucide('music')
export const MembersGridIcon = lucide('users')
export const ShopGridIcon = lucide('shopping-cart')
export const PressGridIcon = lucide('newspaper')
export const EventsIcon = lucide('calendar-days')

// New blocks
export const ReleaseSpotlightIcon = lucide('star')
export const DiscographyGridIcon = lucide('library')
export const VideoGalleryIcon = lucide('film')
export const TourDatesIcon = lucide('map-pin')
export const EmailSignupIcon = lucide('mail-plus')
export const NewsletterSignupIcon = lucide('newspaper')
export const FanWallIcon = lucide('heart')
export const DownloadsCenterIcon = lucide('folder-down')
export const TimelineBlockIcon = lucide('git-branch')
export const MediaTextIcon = lucide('layout')
export const SmartLinksIcon = lucide('external-link')
export const CreditsIcon = lucide('scroll-text')
export const ShortsWallIcon = lucide('smartphone')
export const NewsFeedIcon = lucide('file-text')
export const PressCoverageIcon = lucide('file-search')
export const PollBlockIcon = lucide('vote')

// Widgets
export const WidgetIcon = lucide('puzzle')
export const ContactFormIcon = lucide('mail')
export const ContactInfoIcon = lucide('at-sign')

// Follow
export const ProfileIcon = lucide('user-circle')
export const LinkStackIcon = lucide('link')

// Layout & Decorative
export const SpacerIcon = lucide('minus')
export const DividerIcon = lucide('separator-horizontal')
export const MarqueeIcon = lucide('move-horizontal')
export const LyricIcon = lucide('mic-vocal')

// Settings group tabs
export const GeneralIcon = lucide('pen-line')
export const BrandingIcon = lucide('image')
export const NavigationIcon = lucide('compass')
export const SocialIcon = lucide('smartphone')
export const SEOIcon = lucide('search')
