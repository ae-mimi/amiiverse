import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'redirect',
    title: 'Redirect',
    type: 'document',
    fields: [
        defineField({
            name: 'from',
            title: 'From Path',
            type: 'string',
            description: 'The old URL path (e.g. "/old-page").',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'to',
            title: 'To Path',
            type: 'string',
            description: 'The new URL path or full URL (e.g. "/new-page" or "https://example.com").',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'statusCode',
            title: 'Redirect Type',
            type: 'number',
            description: '301 = Permanent, 302 = Temporary.',
            options: {
                list: [
                    { title: '301 — Permanent', value: 301 },
                    { title: '302 — Temporary', value: 302 },
                ],
                layout: 'radio',
            },
            initialValue: 301,
        }),
    ],
    preview: {
        select: { from: 'from', to: 'to', code: 'statusCode' },
        prepare({ from, to, code }) {
            return {
                title: `${from || '/'} → ${to || '/'}`,
                subtitle: `${code || 301} redirect`,
            }
        },
    },
})
