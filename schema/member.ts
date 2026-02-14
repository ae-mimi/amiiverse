import { defineField, defineType } from 'sanity'
import { MemberIcon } from './icons'

export default defineType({
    name: 'member',
    title: 'Member',
    type: 'document',
    icon: MemberIcon,
    groups: [
        { name: 'profile', title: 'Profile', default: true },
        { name: 'identity', title: 'Identity & Virtues' },
        { name: 'bio', title: 'Biography' },
        { name: 'socials', title: 'Socials' },
    ],
    fields: [
        // ── Profile ─────────────────────────────────
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            description: 'The member\'s display name.',
            group: 'profile',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'URL Slug',
            type: 'slug',
            group: 'profile',
            options: { source: 'name', maxLength: 96 },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'role',
            title: 'Role',
            type: 'string',
            description: 'e.g. Vocalist, Dancer, Rapper',
            group: 'profile',
        }),
        defineField({
            name: 'profilePhoto',
            title: 'Profile Photo',
            type: 'image',
            description: 'A portrait or profile photo. Use a square or 3:4 ratio.',
            group: 'profile',
            options: { hotspot: true },
            validation: (rule) => rule.required(),
        }),

        // ── Identity & Virtues ──────────────────────
        defineField({
            name: 'emblem',
            title: 'Emblem',
            type: 'image',
            description: 'A personal emblem or symbol representing this member.',
            group: 'identity',
            options: { hotspot: true },
        }),
        defineField({
            name: 'emblemMeaning',
            title: 'Emblem Meaning',
            type: 'text',
            rows: 4,
            description: 'What the emblem represents.',
            group: 'identity',
        }),
        defineField({
            name: 'virtues',
            title: 'Virtues',
            type: 'array',
            group: 'identity',
            of: [{
                type: 'object',
                name: 'virtue',
                fields: [
                    defineField({ name: 'title', title: 'Virtue', type: 'string', validation: (rule) => rule.required() }),
                    defineField({ name: 'whyItMatters', title: 'Why It Matters', type: 'text', rows: 3 }),
                    defineField({ name: 'howToLiveIt', title: 'How to Live It', type: 'text', rows: 3 }),
                ],
                preview: {
                    select: { title: 'title' },
                },
            }],
        }),

        // ── Biography ───────────────────────────────
        defineField({
            name: 'bioShort',
            title: 'Short Bio',
            type: 'text',
            rows: 3,
            description: 'A one-liner shown on cards and listings.',
            group: 'bio',
        }),
        defineField({
            name: 'bioLong',
            title: 'Full Bio',
            type: 'text',
            rows: 10,
            description: 'The full biography for the member\'s detail page.',
            group: 'bio',
        }),
        defineField({
            name: 'fact',
            title: 'Fun Fact',
            type: 'text',
            description: 'A short fun fact about this member.',
            rows: 3,
            group: 'bio',
        }),

        // ── Socials ─────────────────────────────────
        defineField({
            name: 'socials',
            title: 'Social Links',
            type: 'object',
            group: 'socials',
            fields: [
                defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
                defineField({ name: 'tiktok', title: 'TikTok', type: 'url' }),
                defineField({ name: 'x', title: 'X (Twitter)', type: 'url' }),
                defineField({ name: 'youtube', title: 'YouTube', type: 'url' }),
                defineField({ name: 'spotify', title: 'Spotify', type: 'url' }),
            ],
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'role',
            media: 'profilePhoto',
        },
    },
})
