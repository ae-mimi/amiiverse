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
        { name: 'theme', title: 'Theme', icon: ThemeIcon },
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
            title: 'Theme Override',
            type: 'object',
            group: 'theme',
            description: 'If this campaign is ACTIVE, these settings will override the default site theme.',
            options: { collapsible: true, collapsed: false },
            initialValue: {
                _type: 'themeOverride',
                primaryColor: { _type: 'color' },
                secondaryColor: { _type: 'color' },
                accentColor: { _type: 'color' },
                backgroundColor: { _type: 'color' },
                textColor: { _type: 'color' },
                mutedTextColor: { _type: 'color' },
            },
            fields: [
                defineField({
                    name: 'primaryColor',
                    title: 'Primary Color',
                    type: 'color',
                    description: 'Main brand color (e.g., used for buttons, links).',
                }),
                defineField({
                    name: 'secondaryColor',
                    title: 'Secondary Color',
                    type: 'color',
                    description: 'Secondary brand color.',
                }),
                defineField({
                    name: 'accentColor',
                    title: 'Accent Color',
                    type: 'color',
                    description: 'Used for highlights and accents.',
                }),
                defineField({
                    name: 'backgroundColor',
                    title: 'Background Color',
                    type: 'color',
                    description: 'Page background color.',
                }),
                defineField({
                    name: 'textColor',
                    title: 'Text Color',
                    type: 'color',
                    description: 'Main body text color.',
                }),
                defineField({
                    name: 'mutedTextColor',
                    title: 'Muted Text Color',
                    type: 'color',
                    description: 'Lighter text for secondary information.',
                }),
                defineField({
                    name: 'buttonStyle',
                    title: 'Button Style',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Filled', value: 'filled' },
                            { title: 'Outline', value: 'outline' },
                            { title: 'Ghost', value: 'ghost' },
                        ],
                        layout: 'radio',
                    },
                }),
                defineField({
                    name: 'borderRadiusScale',
                    title: 'Border Radius',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Small (Sharp)', value: 'small' },
                            { title: 'Medium (Rounded)', value: 'medium' },
                            { title: 'Large (Pill)', value: 'large' },
                        ],
                        layout: 'radio',
                    },
                }),
                defineField({
                    name: 'headingFont',
                    title: 'Heading Font',
                    type: 'string',
                    description: 'Font family name for headings (must be loaded in CSS).',
                }),
                defineField({
                    name: 'bodyFont',
                    title: 'Body Font',
                    type: 'string',
                    description: 'Font family name for body text (must be loaded in CSS).',
                }),
                defineField({
                    name: 'logo_navy',
                    title: 'Logo (Navy / Dark)',
                    type: 'image',
                    description: 'Dark version of the logo used on light backgrounds for this campaign.',
                    options: { hotspot: true },
                }),
                defineField({
                    name: 'logo_yellow',
                    title: 'Logo (Yellow / Light)',
                    type: 'image',
                    description: 'Light version of the logo used on dark backgrounds for this campaign.',
                    options: { hotspot: true },
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
