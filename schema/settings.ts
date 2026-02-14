import { defineField, defineType } from 'sanity'
import { SettingsIcon, GeneralIcon, BrandingIcon, NavigationIcon, SocialIcon } from './icons'

export default defineType({
    name: 'settings',
    title: 'Site Settings',
    type: 'document',
    icon: SettingsIcon,
    groups: [
        { name: 'general', title: 'General', icon: GeneralIcon, default: true },
        { name: 'seo', title: 'SEO' },
        { name: 'branding', title: 'Branding', icon: BrandingIcon },
        { name: 'navigation', title: 'Navigation', icon: NavigationIcon },
        { name: 'social', title: 'Social Media', icon: SocialIcon },
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
            group: 'general',
        }),

        defineField({
            name: 'theme',
            title: 'Default Theme',
            type: 'themeSettings',
            group: 'general',
            description: 'The base look and feel of the site.',
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
            title: 'Logo (Navy / Dark)',
            type: 'image',
            description: 'The dark version of the logo. Used on light backgrounds.',
            group: 'branding',
            options: { hotspot: true },
        }),
        defineField({
            name: 'logo_yellow',
            title: 'Logo (Yellow / Light)',
            type: 'image',
            description: 'The light version of the logo. Used on dark backgrounds.',
            group: 'branding',
            options: { hotspot: true },
        }),
        defineField({
            name: 'favicons',
            title: 'Favicons',
            type: 'object',
            description: 'The small icons that appear in browser tabs. Upload different sizes for different devices.',
            group: 'branding',
            options: { collapsible: true, collapsed: true },
            fields: [
                defineField({ name: 'ico', title: 'ICO (32×32 — Legacy browsers)', type: 'image', description: 'For older browsers like Internet Explorer.' }),
                defineField({ name: 'svg', title: 'SVG (Modern browsers)', type: 'image', description: 'Scalable icon for Chrome, Firefox, Safari.' }),
                defineField({ name: 'png96', title: 'PNG (96×96)', type: 'image', description: 'Standard icon used on most devices.' }),
                defineField({ name: 'apple', title: 'Apple Touch Icon (180×180)', type: 'image', description: 'Used when someone adds the site to their iPhone home screen.' }),
                defineField({ name: 'manifest192', title: 'Web App Icon (192×192)', type: 'image', description: 'Used for Android home screen shortcuts.' }),
                defineField({ name: 'manifest512', title: 'Web App Splash (512×512)', type: 'image', description: 'High-res icon for app-like experiences.' }),
            ],
        }),
        defineField({
            name: 'enable_follow_link',
            title: 'Show "FOLLOW" Button',
            description: 'Toggles the special "FOLLOW" button in the mobile menu.',
            type: 'boolean',
            group: 'branding',
            initialValue: false,
        }),

        // ── Navigation ───────────────────────────────────────
        defineField({
            name: 'nav',
            title: 'Header Menu',
            description: 'Links that appear in the top navigation bar. Drag to reorder.',
            type: 'array',
            group: 'navigation',
            of: [
                {
                    type: 'object',
                    title: 'Menu Link',
                    fields: [
                        defineField({ name: 'label', type: 'string', title: 'Label', description: 'The text visitors see.', validation: (rule) => rule.required() }),
                        defineField({ name: 'href', type: 'string', title: 'URL', description: 'Where this link goes (e.g. /about or https://...).', validation: (rule) => rule.required() }),
                        defineField({ name: 'is_special', type: 'boolean', title: 'Highlight this link?', description: 'Makes the link stand out visually (e.g. bold / accent color).', initialValue: false }),
                        defineField({ name: 'disabled', type: 'boolean', title: 'Disable this link?', description: 'Keeps the link visible but not clickable (e.g. "Coming Soon").', initialValue: false }),
                    ],
                    preview: {
                        select: { title: 'label', subtitle: 'href', disabled: 'disabled' },
                        prepare({ title, subtitle, disabled }) {
                            return {
                                title: title || 'Untitled Link',
                                subtitle: disabled ? `${subtitle} (disabled)` : subtitle,
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
                    name: 'copyright',
                    title: 'Copyright Text',
                    type: 'string',
                    description: 'Text at the bottom of every page (e.g. "© 2026 amii").',
                }),
                defineField({
                    name: 'links',
                    title: 'Footer Menu',
                    description: 'Links below the logo in the footer. Drag to reorder.',
                    type: 'array',
                    of: [
                        {
                            type: 'object',
                            title: 'Footer Link',
                            fields: [
                                defineField({ name: 'label', type: 'string', title: 'Label', validation: (rule) => rule.required() }),
                                defineField({ name: 'href', type: 'string', title: 'URL', validation: (rule) => rule.required() }),
                                defineField({ name: 'is_special', type: 'boolean', title: 'Highlight this link?', initialValue: false }),
                                defineField({ name: 'disabled', type: 'boolean', title: 'Disable this link?', initialValue: false }),
                            ],
                            preview: {
                                select: { title: 'label', subtitle: 'href' },
                                prepare({ title, subtitle }) {
                                    return { title: title || 'Untitled Link', subtitle }
                                },
                            },
                        },
                    ],
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
