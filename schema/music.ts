import { defineField, defineType } from 'sanity'
import { MusicIcon } from './icons'

export default defineType({
    name: 'music',
    title: 'Music',
    type: 'document',
    icon: MusicIcon,
    groups: [
        { name: 'info', title: 'Track Info', default: true },
        { name: 'credits', title: 'Credits' },
        { name: 'streaming', title: 'Streaming Links' },
    ],
    fields: [
        defineField({
            name: 'title',
            title: 'Song Title',
            type: 'string',
            group: 'info',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'date',
            title: 'Release Date',
            type: 'date',
            group: 'info',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'cover',
            title: 'Cover Art',
            type: 'image',
            description: 'Square image works best (e.g. 1500×1500).',
            group: 'info',
            options: { hotspot: true },
        }),
        defineField({
            name: 'audio_file',
            title: 'Audio File',
            type: 'file',
            description: 'Upload an audio preview (MP3, WAV, etc.) for the on-site player.',
            group: 'info',
            options: { accept: 'audio/*' },
        }),

        // Credits
        defineField({
            name: 'performed_by',
            title: 'Performed By',
            type: 'string',
            group: 'credits',
        }),
        defineField({
            name: 'lyrics',
            title: 'Lyrics By',
            type: 'string',
            group: 'credits',
        }),
        defineField({
            name: 'producer',
            title: 'Produced By',
            type: 'string',
            group: 'credits',
        }),

        // Streaming
        defineField({
            name: 'spotify',
            title: 'Spotify URL',
            type: 'url',
            description: 'Paste the Spotify link to this track.',
            group: 'streaming',
        }),
        defineField({
            name: 'apple_music',
            title: 'Apple Music URL',
            type: 'url',
            description: 'Paste the Apple Music link to this track.',
            group: 'streaming',
        }),
        defineField({
            name: 'youtube_music',
            title: 'YouTube Music URL',
            type: 'url',
            description: 'Paste the YouTube Music link to this track.',
            group: 'streaming',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'performed_by',
            media: 'cover',
        },
    },
})
