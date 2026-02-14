import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'fanSubmission',
    title: 'Fan Submission',
    type: 'document',
    fields: [
        defineField({
            name: 'displayName',
            title: 'Display Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'string',
            description: 'Where they are from (optional).',
        }),
        defineField({
            name: 'message',
            title: 'Message',
            type: 'text',
            rows: 4,
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            description: 'Fan art, photo, or other image.',
            options: { hotspot: true },
        }),
        defineField({
            name: 'type',
            title: 'Submission Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Message', value: 'message' },
                    { title: 'Fan Art', value: 'fanArt' },
                    { title: 'Photo', value: 'photo' },
                ],
                layout: 'radio',
            },
            initialValue: 'message',
        }),
        defineField({
            name: 'status',
            title: 'Moderation Status',
            type: 'string',
            options: {
                list: [
                    { title: '⏳ Pending', value: 'pending' },
                    { title: '✅ Approved', value: 'approved' },
                    { title: '❌ Rejected', value: 'rejected' },
                ],
                layout: 'radio',
            },
            initialValue: 'pending',
        }),
        defineField({
            name: 'submittedAt',
            title: 'Submitted At',
            type: 'datetime',
        }),
    ],
    preview: {
        select: { title: 'displayName', subtitle: 'message', status: 'status', media: 'image' },
        prepare({ title, subtitle, status, media }) {
            const statusLabel: Record<string, string> = { pending: '⏳', approved: '✅', rejected: '❌' }
            return {
                title: `${statusLabel[status || 'pending'] || ''} ${title || 'Anonymous'}`,
                subtitle: subtitle ? subtitle.substring(0, 60) : '',
                media,
            }
        },
    },
})
