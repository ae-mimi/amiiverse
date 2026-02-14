import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'poll',
    title: 'Poll',
    type: 'document',
    fields: [
        defineField({
            name: 'question',
            title: 'Question',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'URL Slug',
            type: 'slug',
            options: { source: 'question', maxLength: 96 },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'options',
            title: 'Options',
            type: 'array',
            of: [{ type: 'string' }],
            validation: (rule) => rule.min(2),
        }),
        defineField({
            name: 'startDate',
            title: 'Start Date',
            type: 'datetime',
        }),
        defineField({
            name: 'endDate',
            title: 'End Date',
            type: 'datetime',
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Draft', value: 'draft' },
                    { title: 'Live', value: 'live' },
                    { title: 'Closed', value: 'closed' },
                ],
                layout: 'radio',
            },
            initialValue: 'draft',
        }),
        defineField({
            name: 'voteCounts',
            title: 'Vote Counts',
            type: 'array',
            description: 'One number per option, in the same order. Managed by the API — do not edit manually.',
            of: [{ type: 'number' }],
            readOnly: true,
        }),
    ],
    preview: {
        select: { title: 'question', status: 'status', voteCounts: 'voteCounts', options: 'options' },
        prepare({ title, status, voteCounts, options }) {
            const statusLabel: Record<string, string> = { draft: '📝 Draft', live: '🟢 Live', closed: '🔒 Closed' }
            const totalVotes = (voteCounts || []).reduce((a: number, b: number) => a + b, 0)
            const optionCount = options?.length || 0

            // Build subtitle: "🟢 Live · 42 votes · 3 options"
            const parts = [statusLabel[status || 'draft'] || '']
            if (totalVotes > 0) parts.push(`${totalVotes} vote${totalVotes === 1 ? '' : 's'}`)
            if (optionCount > 0) parts.push(`${optionCount} options`)

            return {
                title: title || 'Untitled Poll',
                subtitle: parts.filter(Boolean).join(' · '),
            }
        },
    },
})
