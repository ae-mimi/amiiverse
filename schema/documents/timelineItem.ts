import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'timelineItem',
    title: 'Timeline Item',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'date',
            title: 'Date',
            type: 'date',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4,
        }),
        defineField({
            name: 'media',
            title: 'Media',
            type: 'image',
            description: 'An optional photo or image for this milestone.',
            options: { hotspot: true },
        }),
    ],
    orderings: [
        { title: 'Oldest First', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] },
        { title: 'Newest First', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
    ],
    preview: {
        select: { title: 'title', date: 'date', media: 'media' },
        prepare({ title, date, media }) {
            return {
                title: title || 'Milestone',
                subtitle: date || '',
                media,
            }
        },
    },
})
