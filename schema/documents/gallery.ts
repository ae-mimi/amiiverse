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
                ],
                preview: {
                    select: { media: 'image', caption: 'caption', alt: 'alt' },
                    prepare({ media, caption, alt }) {
                        return { title: caption || alt || 'Photo', media }
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
