import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'campaign',
    title: 'Campaign',
    type: 'document',
    description: 'Era rollouts, release phases, or major site takeovers.',
    fields: [
        defineField({
            name: 'title',
            title: 'Campaign Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'URL Slug',
            type: 'slug',
            options: { source: 'title', maxLength: 96 },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
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
        }),
        defineField({
            name: 'endDate',
            title: 'End Date',
            type: 'datetime',
        }),
        defineField({
            name: 'palette',
            title: 'Campaign Colors (Legacy)',
            type: 'object',
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
            type: 'themeSettings',
            description: 'If this campaign is ACTIVE, these settings will override the default site theme.',
            options: { collapsible: true, collapsed: false },
        }),
        defineField({
            name: 'featuredRelease',
            title: 'Featured Release',
            type: 'reference',
            to: [{ type: 'release' }],
        }),
        defineField({
            name: 'ctaLinks',
            title: 'CTA Links',
            type: 'array',
            of: [{ type: 'link' }],
        }),
        defineField({
            name: 'seo',
            title: 'SEO',
            type: 'seo',
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
