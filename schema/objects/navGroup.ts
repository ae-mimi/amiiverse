import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'navGroup',
    title: 'Navigation Group',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Group Title',
            type: 'string',
            description: 'Heading for this group of links (e.g. "Company", "Resources").',
        }),
        defineField({
            name: 'items',
            title: 'Links',
            type: 'array',
            of: [{ type: 'navItem' }],
        }),
    ],
    preview: {
        select: { title: 'title', items: 'items' },
        prepare({ title, items }) {
            const count = items?.length || 0
            return {
                title: title || 'Nav Group',
                subtitle: `${count} link${count !== 1 ? 's' : ''}`,
            }
        },
    },
})
