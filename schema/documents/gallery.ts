import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'gallery',
    title: 'Gallery',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Gallery Title',
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
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Press / Promo', value: 'press' },
                    { title: 'Behind the Scenes', value: 'behindTheScenes' },
                    { title: 'Era / Concept', value: 'era' },
                    { title: 'Live / Concert', value: 'live' },
                    { title: 'Fan Content', value: 'fan' },
                ],
                layout: 'dropdown',
            },
        }),
        defineField({
            name: 'visibility',
            title: 'Gallery Visibility',
            type: 'string',
            description: 'Only Public galleries can appear on the public /gallery page.',
            options: {
                list: [
                    { title: 'Draft / Internal', value: 'draft' },
                    { title: 'Public', value: 'public' },
                    { title: 'Archived', value: 'archived' },
                ],
                layout: 'radio',
            },
            initialValue: 'draft',
        }),
        defineField({
            name: 'era',
            title: 'Era / Phase',
            type: 'string',
            description: 'Examples: Pre-debut, Ordinary People, Tour, Press Run.',
        }),
        defineField({
            name: 'campaign',
            title: 'Campaign',
            type: 'reference',
            to: [{ type: 'campaign' }],
        }),
        defineField({
            name: 'eventDate',
            title: 'Gallery Date',
            type: 'date',
            description: 'Used for date sorting and filtering.',
        }),
        defineField({
            name: 'items',
            title: 'Photos',
            type: 'array',
            of: [{
                type: 'object',
                name: 'galleryItem',
                fields: [
                    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, validation: (rule) => rule.required() }),
                    defineField({ name: 'alt', title: 'Alt Text', type: 'string', description: 'Describe the image for accessibility.' }),
                    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
                    defineField({ name: 'credit', title: 'Photo Credit', type: 'string', description: 'Photographer or source.' }),
                    defineField({
                        name: 'visibility',
                        title: 'Photo Visibility',
                        type: 'string',
                        description: 'Only Public photos inside Public galleries appear on /gallery.',
                        options: {
                            list: [
                                { title: 'Draft / Internal', value: 'draft' },
                                { title: 'Public', value: 'public' },
                                { title: 'Archived', value: 'archived' },
                            ],
                            layout: 'radio',
                        },
                        initialValue: 'draft',
                    }),
                    defineField({ name: 'featured', title: 'Feature in Teasers', type: 'boolean', initialValue: false }),
                    defineField({ name: 'date', title: 'Photo Date', type: 'date' }),
                    defineField({ name: 'era', title: 'Era / Phase', type: 'string' }),
                    defineField({ name: 'campaign', title: 'Campaign', type: 'reference', to: [{ type: 'campaign' }] }),
                    defineField({ name: 'members', title: 'Members in Photo', type: 'array', of: [{ type: 'reference', to: [{ type: 'member' }] }] }),
                ],
                preview: {
                    select: { media: 'image', caption: 'caption', alt: 'alt', visibility: 'visibility' },
                    prepare({ media, caption, alt, visibility }) {
                        return { title: caption || alt || 'Photo', subtitle: visibility || 'draft', media }
                    },
                },
            }],
            validation: (rule) => rule.min(1),
        }),
    ],
    preview: {
        select: { title: 'title', category: 'category', items: 'items' },
        prepare({ title, category, items }) {
            const count = items?.length || 0
            return {
                title: title || 'Untitled Gallery',
                subtitle: `${category || 'Uncategorized'} · ${count} photo${count !== 1 ? 's' : ''}`,
            }
        },
    },
})
