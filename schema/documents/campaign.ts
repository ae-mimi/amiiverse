import { defineField, defineType } from 'sanity'
import { CampaignIcon, GeneralIcon, ThemeIcon, PageIcon, SEOIcon } from '../icons'

export default defineType({
    name: 'campaign',
    title: 'Campaign',
    type: 'document',
    icon: CampaignIcon,
    description: 'Era rollouts, release phases, or major site takeovers.',
    groups: [
        { name: 'general', title: 'General', icon: GeneralIcon, default: true },
        { name: 'theme', title: 'Branding & Theme', icon: ThemeIcon },
        { name: 'content', title: 'Content', icon: PageIcon },
        { name: 'seo', title: 'SEO', icon: SEOIcon },
    ],
    fields: [
        defineField({
            name: 'title',
            title: 'Campaign Title',
            type: 'string',
            group: 'general',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'URL Slug',
            type: 'slug',
            group: 'general',
            options: { source: 'title', maxLength: 96 },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            group: 'general',
            options: {
                list: [
                    { title: 'Draft', value: 'draft' },
                    { title: 'Live', value: 'live' },
                    { title: 'Archived', value: 'archived' },
                ],
                layout: 'radio',
            },
            initialValue: 'draft',
        }),
        defineField({
            name: 'startDate',
            title: 'Start Date',
            type: 'datetime',
            group: 'general',
        }),
        defineField({
            name: 'endDate',
            title: 'End Date',
            type: 'datetime',
            group: 'general',
        }),
        defineField({
            name: 'palette',
            title: 'Campaign Colors (Legacy)',
            type: 'object',
            group: 'theme',
            fields: [
                defineField({ name: 'primary', title: 'Primary', type: 'string', description: 'Hex code e.g. #E44598' }),
                defineField({ name: 'secondary', title: 'Secondary', type: 'string' }),
                defineField({ name: 'accent', title: 'Accent', type: 'string' }),
            ],
            hidden: true, // Hiding legacy field in favor of full theme override
        }),
        defineField({
            name: 'themeOverride',
            title: 'Theme Override (Campaign Style)',
            type: 'themeSettings',
            group: 'theme',
            description: 'If this campaign is active, these theme values override the default Site Settings palette/typography.',
            options: { collapsible: true, collapsed: false },
        }),
        defineField({
            name: 'branding',
            title: 'Branding Assets Override',
            type: 'object',
            group: 'theme',
            description: 'Optional campaign-specific logos and favicons. Only applies while this campaign is active.',
            options: { collapsible: true, collapsed: true },
            fields: [
                defineField({
                    name: 'logo_navy',
                    title: 'Primary Logo (For Light Backgrounds)',
                    type: 'image',
                    description: 'Upload the main/darker logo variant to display on white or light sections for this campaign.',
                    options: { hotspot: true },
                }),
                defineField({
                    name: 'logo_yellow',
                    title: 'Secondary Logo (For Dark Backgrounds)',
                    type: 'image',
                    description: 'Upload the light/high-contrast logo variant for dark sections and overlays for this campaign.',
                    options: { hotspot: true },
                }),
                defineField({
                    name: 'favicons',
                    title: 'Favicons',
                    type: 'object',
                    description: 'Upload the full favicon set from RealFaviconGenerator. Use the exact matching file for each field.',
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
                            description: 'Shown when users add the site to iPhone/iPad home screen.',
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
            ],
        }),
        defineField({
            name: 'featuredRelease',
            title: 'Featured Release',
            type: 'reference',
            group: 'content',
            to: [{ type: 'release' }],
        }),
        defineField({
            name: 'ctaLinks',
            title: 'CTA Links',
            type: 'array',
            group: 'content',
            of: [{ type: 'link' }],
        }),
        defineField({
            name: 'seo',
            title: 'SEO',
            type: 'seo',
            group: 'seo',
        }),
    ],
    preview: {
        select: { title: 'title', status: 'status' },
        prepare({ title, status }) {
            const statusLabel: Record<string, string> = { draft: '📝 Draft', live: '🟢 Live', archived: '📦 Archived' }
            return {
                title: title || 'Untitled Campaign',
                subtitle: statusLabel[status || 'draft'] || '',
            }
        },
    },
})
