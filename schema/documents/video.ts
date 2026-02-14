import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'video',
    title: 'Video',
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
            name: 'videoType',
            title: 'Video Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Music Video', value: 'musicVideo' },
                    { title: 'Performance', value: 'performance' },
                    { title: 'Dance Practice', value: 'dancePractice' },
                    { title: 'Live Session', value: 'liveSession' },
                    { title: 'Teaser / Trailer', value: 'teaser' },
                    { title: 'Short (TikTok/Reels/Shorts)', value: 'shorts' },
                ],
                layout: 'dropdown',
            },
        }),
        defineField({
            name: 'release',
            title: 'Related Release',
            type: 'reference',
            to: [{ type: 'release' }],
            description: 'If this video is for a specific release, link it here.',
        }),
        defineField({
            name: 'youtubeUrl',
            title: 'YouTube URL',
            type: 'url',
            description: 'Full YouTube video URL.',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'embedUrl',
            title: 'Embed URL (Optional)',
            type: 'url',
            description: 'Override embed URL if different from YouTube (e.g. Vimeo).',
        }),
        defineField({
            name: 'poster',
            title: 'Thumbnail',
            type: 'image',
            description: 'Custom thumbnail to display before the video plays.',
            options: { hotspot: true },
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published Date',
            type: 'datetime',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4,
        }),
        defineField({
            name: 'seo',
            title: 'SEO',
            type: 'seo',
        }),
    ],
    preview: {
        select: { title: 'title', type: 'videoType', media: 'poster' },
        prepare({ title, type, media }) {
            const typeLabels: Record<string, string> = {
                musicVideo: '🎬 Music Video',
                performance: '🎤 Performance',
                dancePractice: '💃 Dance Practice',
                liveSession: '🎵 Live Session',
                teaser: '🎥 Teaser',
                shorts: '📱 Short',
            }
            return {
                title: title || 'Untitled Video',
                subtitle: typeLabels[type || ''] || type || '',
                media,
            }
        },
    },
})
