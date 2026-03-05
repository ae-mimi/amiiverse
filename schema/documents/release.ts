import { defineField, defineType } from 'sanity'
import {
    ReleaseIcon,
    GeneralIcon,
    SmartLinksIcon,
    RichTextIcon,
    GalleryIcon,
    SEOIcon,
} from '../icons'

export default defineType({
    name: 'release',
    title: 'Release',
    type: 'document',
    icon: ReleaseIcon,
    groups: [
        { name: 'info', title: 'Release Info', icon: GeneralIcon, default: true },
        { name: 'links', title: 'Links & Streaming', icon: SmartLinksIcon },
        { name: 'content', title: 'Story & Credits', icon: RichTextIcon },
        { name: 'media', title: 'Media', icon: GalleryIcon },
        { name: 'seo', title: 'SEO', icon: SEOIcon },
    ],
    fields: [
        // ── Info ─────────────────────────────────────
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            group: 'info',
            description: 'The name of this release.',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'URL Slug',
            type: 'slug',
            group: 'info',
            options: { source: 'title', maxLength: 96 },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'releaseType',
            title: 'Release Type',
            type: 'string',
            group: 'info',
            options: {
                list: [
                    { title: 'Single', value: 'single' },
                    { title: 'EP', value: 'ep' },
                    { title: 'Album', value: 'album' },
                ],
                layout: 'radio',
            },
            initialValue: 'single',
        }),
        defineField({
            name: 'releaseDate',
            title: 'Release Date',
            type: 'date',
            group: 'info',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'artwork',
            title: 'Cover Artwork',
            type: 'image',
            group: 'info',
            description: 'Square image works best (e.g. 3000×3000).',
            options: { hotspot: true },
        }),

        // ── Links ────────────────────────────────────
        defineField({
            name: 'platformLinks',
            title: 'Streaming Links',
            type: 'platformLinks',
            group: 'links',
        }),
        defineField({
            name: 'smartLinkUrl',
            title: 'Smart Link URL',
            type: 'url',
            group: 'links',
            description: 'A single link that lets fans choose their platform (e.g. Linkfire, ToneDen).',
        }),
        defineField({
            name: 'preSaveUrl',
            title: 'Pre-Save URL',
            type: 'url',
            group: 'links',
            description: 'Pre-save/pre-add link for upcoming releases.',
        }),
        defineField({
            name: 'versions',
            title: 'Alternate Versions',
            type: 'array',
            group: 'links',
            description: 'Acoustic, Sped Up, Remix, etc.',
            of: [{
                type: 'object',
                name: 'releaseVersion',
                fields: [
                    defineField({ name: 'label', title: 'Version Name', type: 'string', description: 'e.g. Acoustic, Sped Up', validation: (rule) => rule.required() }),
                    defineField({ name: 'platformLinks', title: 'Links', type: 'platformLinks' }),
                ],
                preview: {
                    select: { title: 'label' },
                },
            }],
        }),

        // ── Content ──────────────────────────────────
        defineField({
            name: 'tracklist',
            title: 'Tracklist',
            type: 'array',
            group: 'content',
            of: [{ type: 'reference', to: [{ type: 'track' }] }],
        }),
        defineField({
            name: 'story',
            title: 'Behind the Release',
            type: 'text',
            group: 'content',
            rows: 8,
            description: 'The story behind this release — inspiration, process, meaning.',
        }),
        defineField({
            name: 'credits',
            title: 'Credits',
            type: 'array',
            group: 'content',
            of: [{
                type: 'object',
                name: 'credit',
                fields: [
                    defineField({ name: 'role', title: 'Role', type: 'string', description: 'e.g. Produced by, Written by', validation: (rule) => rule.required() }),
                    defineField({ name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required() }),
                ],
                preview: {
                    select: { title: 'role', subtitle: 'name' },
                },
            }],
        }),
        defineField({
            name: 'lyricsHighlights',
            title: 'Lyrics Highlights',
            type: 'array',
            group: 'content',
            description: 'Standout lyrics to feature on the page.',
            of: [{
                type: 'object',
                name: 'lyricHighlight',
                fields: [
                    defineField({ name: 'text', title: 'Lyric', type: 'text', rows: 2, validation: (rule) => rule.required() }),
                    defineField({ name: 'trackRef', title: 'From Track', type: 'reference', to: [{ type: 'track' }] }),
                ],
                preview: {
                    select: { title: 'text' },
                    prepare({ title }) {
                        return { title: title ? `"${title.substring(0, 60)}"` : 'Lyric' }
                    },
                },
            }],
        }),

        // ── Media ────────────────────────────────────
        defineField({
            name: 'featuredVideo',
            title: 'Featured Video',
            type: 'reference',
            group: 'media',
            to: [{ type: 'video' }],
        }),
        defineField({
            name: 'gallery',
            title: 'Photo Gallery',
            type: 'reference',
            group: 'media',
            to: [{ type: 'gallery' }],
        }),

        // ── SEO ──────────────────────────────────────
        defineField({
            name: 'seo',
            title: 'SEO',
            type: 'seo',
            group: 'seo',
        }),
    ],
    preview: {
        select: { title: 'title', type: 'releaseType', media: 'artwork', date: 'releaseDate' },
        prepare({ title, type, media, date }) {
            const typeLabel = { single: 'Single', ep: 'EP', album: 'Album' }[(type || 'single') as 'single' | 'ep' | 'album']
            return {
                title: title || 'Untitled Release',
                subtitle: `${typeLabel} · ${date || 'No date'}`,
                media,
            }
        },
    },
})
