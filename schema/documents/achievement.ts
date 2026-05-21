import { defineField, defineType } from 'sanity'
import { AchievementIcon } from '../icons'

export default defineType({
    name: 'achievement',
    title: 'Achievement / Milestone',
    type: 'document',
    icon: AchievementIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Title / Achievement Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'category',
            title: 'Category / Proof Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Milestone', value: 'milestone' },
                    { title: 'Award', value: 'award' },
                    { title: 'Statistic', value: 'stat' },
                    { title: 'Media Moment', value: 'media' },
                    { title: 'Other', value: 'other' },
                ],
                layout: 'dropdown',
            },
            initialValue: 'milestone',
        }),
        defineField({
            name: 'date',
            title: 'Date',
            type: 'date',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'metric',
            title: 'Metric / Stat / Number',
            type: 'string',
            description: 'Optional short stat, e.g. "100K views".',
        }),
        defineField({
            name: 'url',
            title: 'Supporting Link / Source URL',
            type: 'url',
        }),
        defineField({
            name: 'featured',
            title: 'Featured',
            type: 'boolean',
            initialValue: false,
        }),
    ],
    orderings: [
        { title: 'Newest First', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
        { title: 'Featured First', name: 'featuredDesc', by: [{ field: 'featured', direction: 'desc' }, { field: 'date', direction: 'desc' }] },
    ],
    preview: {
        select: { title: 'title', category: 'category', date: 'date', metric: 'metric', featured: 'featured' },
        prepare({ title, category, date, metric, featured }) {
            return {
                title: `${featured ? '★ ' : ''}${title || 'Untitled Achievement'}`,
                subtitle: [metric, category, date].filter(Boolean).join(' · '),
            }
        },
    },
})
