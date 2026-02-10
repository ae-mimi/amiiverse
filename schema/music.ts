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
            name: 'performed_by',
            title: 'Performed By',
            type: 'string',
        }),
        defineField({
            name: 'lyrics',
            title: 'Lyrics By',
            type: 'string',
        }),
        defineField({
            name: 'producer',
            title: 'Produced By',
            type: 'string',
        }),
        defineField({
            name: 'spotify',
            title: 'Spotify URL',
            type: 'url',
        }),
        defineField({
            name: 'apple_music',
            title: 'Apple Music URL',
            type: 'url',
        }),
        defineField({
            name: 'youtube_music',
            title: 'YouTube Music URL',
            type: 'url',
        }),
        defineField({
            name: 'audio_file',
            title: 'Audio File',
            type: 'file',
            options: {
                accept: 'audio/*',
            },
        }),
    ],
    preview: {
        select: {
            title: 'title',
            media: 'cover',
        },
    },
})
