import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'music',
    title: 'Music',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'date',
            title: 'Release Date',
            type: 'date',
        }),
        defineField({
            name: 'cover',
            title: 'Cover Art',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'spotify',
            title: 'Spotify URL',
            type: 'url',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            media: 'cover',
        },
    },
})
