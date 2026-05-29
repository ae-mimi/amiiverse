import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'track',
    title: 'Track',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Track Title',
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
            name: 'release',
            title: 'Part of Release',
            type: 'reference',
            to: [{ type: 'release' }],
            description: 'Which release does this track belong to?',
        }),
        defineField({
            name: 'trackNumber',
            title: 'Track Number',
            type: 'number',
            description: 'Position on the release tracklist.',
        }),
        defineField({
            name: 'duration',
            title: 'Duration',
            type: 'string',
            description: 'Length of the track (e.g. "3:45").',
        }),
        defineField({
            name: 'isSingleFocus',
            title: 'Single / Focus Track',
            type: 'boolean',
            description: 'Is this track a single or the main focus of the release?',
            initialValue: false,
        }),
        defineField({
            name: 'previewUrl',
            title: 'Audio Preview URL',
            type: 'url',
            description: 'Direct audio file URL for the Music Player, such as an MP3, WAV, M4A, OGG, or WebM file. Put Spotify, Apple Music, YouTube, and other streaming page links in Streaming Links instead.',
            validation: (rule) => rule.custom((value) => {
                if (!value) return true
                const directAudio = /\.(mp3|m4a|aac|wav|ogg|webm)(\?.*)?$/i.test(value)
                if (!directAudio) {
                    return 'Use a direct audio file URL here. Streaming page links belong in Streaming Links.'
                }
                return true
            }).warning(),
        }),
        defineField({
            name: 'lyrics',
            title: 'Lyrics',
            type: 'text',
            rows: 15,
            description: 'Full song lyrics.',
        }),
        defineField({
            name: 'story',
            title: 'Behind the Track',
            type: 'text',
            rows: 6,
            description: 'The story or inspiration behind this track.',
        }),
        defineField({
            name: 'credits',
            title: 'Credits',
            type: 'array',
            of: [{
                type: 'object',
                name: 'credit',
                fields: [
                    defineField({ name: 'role', title: 'Role', type: 'string', validation: (rule) => rule.required() }),
                    defineField({ name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required() }),
                ],
                preview: { select: { title: 'role', subtitle: 'name' } },
            }],
        }),
        defineField({
            name: 'platformLinks',
            title: 'Streaming Links',
            type: 'platformLinks',
        }),
    ],
    preview: {
        select: { title: 'title', num: 'trackNumber', release: 'release.title' },
        prepare({ title, num, release }) {
            return {
                title: num ? `${num}. ${title}` : title || 'Untitled Track',
                subtitle: release || '',
            }
        },
    },
})
