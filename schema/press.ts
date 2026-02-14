import { defineField, defineType } from 'sanity'
import { PressIcon } from './icons'

export default defineType({
    name: 'press',
    title: 'Press',
    type: 'document',
    icon: PressIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Headline',
            type: 'string',
            description: 'The title of the article or press mention.',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'date',
            title: 'Publication Date',
            type: 'date',
            description: 'When this was published.',
        }),
        defineField({
            name: 'file',
            title: 'Link',
            type: 'url',
            description: 'URL to the full article or press release.',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'date',
        },
    },
})
