import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'press',
    title: 'Press',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'date',
            title: 'Date',
            type: 'date',
        }),
        defineField({
            name: 'file',
            title: 'Link or File URL',
            type: 'url',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'date',
        },
    },
})
