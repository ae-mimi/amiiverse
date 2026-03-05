import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'post',
    title: 'News Post',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
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
                    { title: 'Announcement', value: 'announcement' },
                    { title: 'Behind the Scenes', value: 'behindTheScenes' },
                    { title: 'Press', value: 'press' },
                    { title: 'Community', value: 'community' },
                ],
                layout: 'dropdown',
            },
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published Date',
            type: 'datetime',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'coverImage',
            title: 'Cover Image',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'excerpt',
            title: 'Excerpt',
            type: 'text',
            rows: 3,
            description: 'A short preview shown on listing pages.',
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'text',
            rows: 20,
            description: 'The full post body.',
        }),
        defineField({
            name: 'seo',
            title: 'SEO',
            type: 'seo',
        }),
    ],
    orderings: [
        { title: 'Newest First', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
    ],
    preview: {
        select: { title: 'title', category: 'category', date: 'publishedAt', media: 'coverImage' },
        prepare({ title, category, date, media }) {
            const dateStr = date ? new Date(date).toLocaleDateString() : ''
            return {
                title: title || 'Untitled Post',
                subtitle: `${category || ''} · ${dateStr}`,
                media,
            }
        },
    },
})
