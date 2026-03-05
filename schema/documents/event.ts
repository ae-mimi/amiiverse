import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'event',
    title: 'Event',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Event Name',
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
            name: 'eventType',
            title: 'Event Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Show / Concert', value: 'show' },
                    { title: 'Festival', value: 'festival' },
                    { title: 'Appearance', value: 'appearance' },
                    { title: 'Fan Meet / Meetup', value: 'meetup' },
                ],
                layout: 'dropdown',
            },
        }),
        defineField({
            name: 'startDateTime',
            title: 'Start Date & Time',
            type: 'datetime',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'endDateTime',
            title: 'End Date & Time',
            type: 'datetime',
        }),
        defineField({
            name: 'timezone',
            title: 'Timezone',
            type: 'string',
            description: 'e.g. "America/New_York", "Europe/London"',
        }),
        defineField({
            name: 'venueName',
            title: 'Venue',
            type: 'string',
        }),
        defineField({
            name: 'city',
            title: 'City',
            type: 'string',
        }),
        defineField({
            name: 'country',
            title: 'Country',
            type: 'string',
        }),
        defineField({
            name: 'address',
            title: 'Address',
            type: 'string',
        }),
        defineField({
            name: 'mapUrl',
            title: 'Map Link',
            type: 'url',
            description: 'Google Maps or similar link.',
        }),
        defineField({
            name: 'ticketUrl',
            title: 'Primary Ticket Link',
            type: 'url',
        }),
        defineField({
            name: 'ticketProviders',
            title: 'Additional Ticket Providers',
            type: 'array',
            of: [{ type: 'link' }],
        }),
        defineField({
            name: 'ageLimit',
            title: 'Age Restriction',
            type: 'string',
            description: 'e.g. "18+", "All Ages"',
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Announced', value: 'announced' },
                    { title: 'On Sale', value: 'onSale' },
                    { title: 'Sold Out', value: 'soldOut' },
                    { title: 'Cancelled', value: 'cancelled' },
                    { title: 'Postponed', value: 'postponed' },
                ],
                layout: 'dropdown',
            },
            initialValue: 'announced',
        }),
        defineField({
            name: 'lineup',
            title: 'Lineup / Other Acts',
            type: 'array',
            of: [{ type: 'string' }],
        }),
        defineField({
            name: 'notes',
            title: 'Notes',
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
        select: { title: 'title', date: 'startDateTime', city: 'city', status: 'status' },
        prepare({ title, date, city, status }) {
            const dateStr = date ? new Date(date).toLocaleDateString() : 'No date'
            const statusEmoji: Record<string, string> = { announced: '📢', onSale: '🟢', soldOut: '🔴', cancelled: '⚫', postponed: '🟡' }
            return {
                title: title || 'Untitled Event',
                subtitle: `${statusEmoji[status || 'announced'] || ''} ${dateStr} — ${city || ''}`,
            }
        },
    },
})
