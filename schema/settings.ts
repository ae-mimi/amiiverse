import { defineField, defineType } from 'sanity'
import { SettingsIcon, GeneralIcon, BrandingIcon, NavigationIcon, SocialIcon, SEOIcon } from './icons'

export default defineType({
    name: 'settings',
    title: 'Site Settings',
    type: 'document',
    icon: SettingsIcon,
    groups: [
        { name: 'general', title: 'General', icon: GeneralIcon, default: true },
        { name: 'branding', title: 'Branding & Theme', icon: BrandingIcon },
        { name: 'navigation', title: 'Navigation', icon: NavigationIcon },
        { name: 'social', title: 'Social Media', icon: SocialIcon },
        { name: 'seo', title: 'SEO', icon: SEOIcon },
    ],
    fields: [
        // ── General ──────────────────────────────────────────
        defineField({
            name: 'title',
            title: 'Site Title',
            type: 'string',
            description: 'The name of the website. Appears in browser tabs and search results.',
            group: 'general',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Site Description',
            type: 'text',
            description: 'A short summary of the site for search engines (Google, Bing). Keep it under 160 characters.',
            group: 'general',
            rows: 3,
            validation: (rule) => rule.max(160),
        }),
        defineField({
            name: 'keywords',
            title: 'SEO Keywords',
            description: 'Tags that help search engines understand what this site is about. Press Enter after each keyword.',
            type: 'array',
            of: [{ type: 'string' }],
            options: { layout: 'tags' },
            group: 'seo',
        }),

        defineField({
            name: 'theme',
            title: 'Default Theme & Palette',
            type: 'themeSettings',
            group: 'branding',
            description: 'Controls color palette, typography, and core UI style across the site.',
            options: { collapsible: true, collapsed: false },
        }),

        // ── SEO Defaults ────────────────────────────────────────
        defineField({
            name: 'defaultSeo',
            title: 'Default SEO',
            type: 'seo',
            group: 'seo',
            description: 'Fallback SEO settings used when a page does not have its own SEO configured.',
        }),

        // ── Announcement Bar ────────────────────────────────────
        defineField({
            name: 'announcementBar',
            title: 'Announcement Bar',
            type: 'object',
            group: 'general',
            description: 'A small banner across the top of the site. Great for release announcements.',
            options: { collapsible: true, collapsed: true },
            fields: [
                defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false }),
                defineField({ name: 'text', title: 'Message', type: 'string', description: 'Short announcement text.' }),
                defineField({ name: 'link', title: 'Link', type: 'link' }),
                defineField({ name: 'closable', title: 'Allow Dismiss', type: 'boolean', initialValue: true, description: 'Let visitors close the bar.' }),
            ],
        }),

        // ── Branding ─────────────────────────────────────────
        defineField({
            name: 'logo_navy',
            title: 'Primary Logo (For Light Backgrounds)',
            type: 'image',
            description: 'Upload the main/darker logo variant to display on white or light sections.',
            group: 'branding',
            options: { hotspot: true },
        }),
        defineField({
            name: 'logo_yellow',
            title: 'Secondary Logo (For Dark Backgrounds)',
            type: 'image',
            description: 'Upload the light/high-contrast logo variant for dark sections and overlays.',
            group: 'branding',
            options: { hotspot: true },
        }),
        defineField({
            name: 'favicons',
            title: 'Favicons',
            type: 'object',
            description: 'Upload the full favicon set from RealFaviconGenerator. Use the exact matching file for each field.',
            group: 'branding',
            options: { collapsible: true, collapsed: true },
            fields: [
                defineField({
                    name: 'ico',
                    title: 'favicon.ico (Legacy Browser Icon)',
                    type: 'file',
                    description: 'Classic favicon used by older browsers and fallback contexts.',
                    options: { accept: '.ico' },
                }),
                defineField({
                    name: 'svg',
                    title: 'favicon.svg (Vector Browser Icon)',
                    type: 'file',
                    description: 'Modern scalable favicon for current desktop/mobile browsers.',
                    options: { accept: '.svg' },
                }),
                defineField({
                    name: 'png96',
                    title: 'favicon-96x96.png (Standard Browser Icon)',
                    type: 'image',
                    description: 'PNG fallback icon used in browser tabs and bookmark UIs.',
                }),
                defineField({
                    name: 'apple',
                    title: 'apple-touch-icon.png (iOS Home Screen)',
                    type: 'image',
                    description: 'Shown when users add your site to the iPhone/iPad home screen.',
                }),
                defineField({
                    name: 'manifest192',
                    title: 'web-app-manifest-192x192.png (PWA Icon 192x192)',
                    type: 'image',
                    description: 'Android/PWA icon for launcher and install surfaces.',
                }),
                defineField({
                    name: 'manifest512',
                    title: 'web-app-manifest-512x512.png (PWA Icon 512x512)',
                    type: 'image',
                    description: 'High-resolution PWA icon for splash/install contexts.',
                }),
                defineField({
                    name: 'webmanifest',
                    title: 'site.webmanifest (Web App Manifest)',
                    type: 'file',
                    description: 'Manifest JSON file generated with your favicon package.',
                    options: { accept: '.webmanifest,.json,application/manifest+json' },
                }),
            ],
        }),
        defineField({
            name: 'enable_follow_link',
            title: 'Show "FOLLOW" Button',
            description: 'Toggles the special "FOLLOW" item in site navigation.',
            type: 'boolean',
            group: 'navigation',
            initialValue: false,
        }),
        // ── Navigation ───────────────────────────────────────
        defineField({
            name: 'navigationItems',
            title: 'Navigation Menu',
            description: 'Define all site links here. Select where each link should appear.',
            type: 'array',
            group: 'navigation',
            of: [
                {
                    type: 'object',
                    title: 'Menu Link',
                    fields: [
                        defineField({ name: 'link', type: 'link', title: 'Link Target', validation: (rule) => rule.required() }),
                        defineField({ name: 'showInHeader', type: 'boolean', title: 'Show in Header', initialValue: true }),
                        defineField({ name: 'showInFooter', type: 'boolean', title: 'Show in Footer', initialValue: true }),
                        defineField({ name: 'is_special', type: 'boolean', title: 'Highlight this link?', description: 'Makes it stand out visually.', initialValue: false }),
                        defineField({ name: 'disabled', type: 'boolean', title: 'Disable this link?', description: 'Visible but not clickable.', initialValue: false }),
                    ],
                    preview: {
                        select: {
                            label: 'link.label',
                            type: 'link.type',
                            url: 'link.url',
                            internal: 'link.internalRef.slug.current',
                            header: 'showInHeader',
                            footer: 'showInFooter',
                        },
                        prepare({ label, type, url, internal, header, footer }) {
                            const locations = [header && 'Header', footer && 'Footer'].filter(Boolean).join(' + ')
                            return {
                                title: label || 'Untitled Link',
                                subtitle: `${locations || 'Hidden'} — ${type === 'internal' ? `/${internal || ''}` : url || 'No URL'}`,
                            }
                        },
                    },
                },
            ],
        }),
        defineField({
            name: 'footer',
            title: 'Footer',
            type: 'object',
            group: 'navigation',
            fields: [
                defineField({
                    name: 'businessName',
                    title: 'Business Name',
                    type: 'string',
                    description: 'Displayed in the footer for compliance.',
                }),
                defineField({
                    name: 'contactEmail',
                    title: 'Contact Email',
                    type: 'string',
                    description: 'Visible contact email for customers.',
                }),
                defineField({
                    name: 'copyright',
                    title: 'Copyright Text',
                    type: 'string',
                    description: 'Text at the bottom of every page (e.g. "© 2026 amii").',
                }),
            ],
        }),

        // ── Social Media ─────────────────────────────────────
        defineField({
            name: 'socials',
            title: 'Social Media Accounts',
            description: 'Your social media profiles. Icons will appear in the header and footer.',
            type: 'array',
            group: 'social',
            of: [
                {
                    type: 'object',
                    title: 'Social Account',
                    fields: [
                        defineField({
                            name: 'platform',
                            type: 'string',
                            title: 'Platform Name',
                            description: 'e.g. Instagram, TikTok, YouTube',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'url',
                            type: 'url',
                            title: 'Profile URL',
                            description: 'Full link to your profile page.',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'icon',
                            type: 'string',
                            title: 'Icon',
                            description: 'Choose which icon to display.',
                            options: {
                                list: [
                                    { title: 'TikTok', value: 'tiktok' },
                                    { title: 'Instagram', value: 'instagram' },
                                    { title: 'YouTube', value: 'youtube' },
                                    { title: 'Twitter / X', value: 'twitter' },
                                    { title: 'Facebook', value: 'facebook' },
                                    { title: 'Spotify', value: 'spotify' },
                                    { title: 'Apple Music', value: 'applemusic' },
                                    { title: 'SoundCloud', value: 'soundcloud' },
                                ],
                                layout: 'dropdown',
                            },
                            validation: (rule) => rule.required(),
                        }),
                    ],
                    preview: {
                        select: { title: 'platform', subtitle: 'url' },
                        prepare({ title, subtitle }) {
                            return { title: title || 'Social Account', subtitle }
                        },
                    },
                },
            ],
        }),
    ],
    preview: {
        prepare() {
            return { title: 'Site Settings' }
        },
    },
})
