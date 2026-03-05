import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'pressMention',
    title: 'Press Mention',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Headline',
            type: 'string',
            description: 'The title of the article or press mention.',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'publisher',
            title: 'Publisher',
            type: 'string',
            description: 'The name of the publication (e.g. "Billboard", "NME").',
        }),
        defineField({
            name: 'publishedDate',
            title: 'Publication Date',
            type: 'date',
        }),
        defineField({
            name: 'url',
            title: 'Article URL',
            type: 'url',
            description: 'Link to the full article.',
        }),
        defineField({
            name: 'quote',
            title: 'Pull Quote',
            type: 'text',
            rows: 3,
            description: 'A standout quote from the article to display on the site.',
        }),
        defineField({
            name: 'featured',
            title: 'Featured',
            type: 'boolean',
            description: 'Highlight this mention on the homepage or press page.',
            initialValue: false,
        }),
    ],
    orderings: [
        { title: 'Newest First', name: 'dateDesc', by: [{ field: 'publishedDate', direction: 'desc' }] },
    ],
    preview: {
        select: { title: 'title', publisher: 'publisher', date: 'publishedDate', featured: 'featured' },
        prepare({ title, publisher, date, featured }) {
            return {
                title: `${featured ? '⭐ ' : ''}${title || 'Untitled'}`,
                subtitle: `${publisher || ''} · ${date || ''}`,
            }
        },
    },
})
