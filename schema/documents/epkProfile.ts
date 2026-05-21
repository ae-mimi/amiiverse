import { defineField, defineType } from 'sanity'
import { EpkProfileIcon } from '../icons'

export default defineType({
    name: 'epkProfile',
    title: 'EPK Profile / Press Kit Source',
    type: 'document',
    icon: EpkProfileIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Profile Name',
            type: 'string',
            initialValue: 'amii EPK',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'shortBio',
            title: 'Short Bio / Concise Artist Bio',
            type: 'text',
            rows: 4,
        }),
        defineField({
            name: 'longBio',
            title: 'Long Bio / Full Artist Bio',
            type: 'text',
            rows: 10,
        }),
        defineField({
            name: 'keyFacts',
            title: 'Key Facts / Quick Facts',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string' }),
                    defineField({ name: 'value', title: 'Value', type: 'string' }),
                ],
                preview: { select: { title: 'label', subtitle: 'value' } },
            }],
        }),
        defineField({
            name: 'contacts',
            title: 'Industry Contacts / Press Contact',
            type: 'object',
            fields: [
                defineField({ name: 'managementEmail', title: 'Management Email', type: 'string' }),
                defineField({ name: 'pressEmail', title: 'Press Email', type: 'string' }),
                defineField({ name: 'bookingsEmail', title: 'Bookings Email', type: 'string' }),
                defineField({ name: 'inquiriesEmail', title: 'General Inquiries Email', type: 'string' }),
            ],
        }),
        defineField({
            name: 'featuredReleases',
            title: 'Featured Releases',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'release' }] }],
        }),
        defineField({
            name: 'featuredVideos',
            title: 'Featured Videos',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'video' }] }],
        }),
        defineField({
            name: 'featuredAssets',
            title: 'Featured Assets',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'downloadableAsset' }] }],
        }),
        defineField({
            name: 'featuredPress',
            title: 'Featured Press Mentions',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'pressMention' }] }],
        }),
        defineField({
            name: 'featuredAchievements',
            title: 'Featured Achievements',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'achievement' }] }],
        }),
    ],
    preview: {
        select: { title: 'title', subtitle: 'shortBio' },
        prepare({ title, subtitle }) {
            return {
                title: title || 'EPK Profile',
                subtitle: subtitle ? `${subtitle.substring(0, 70)}${subtitle.length > 70 ? '…' : ''}` : 'Industry source of truth',
            }
        },
    },
})
