import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'navItem',
    title: 'Navigation Link',
    type: 'object',
    fields: [
        defineField({
            name: 'label',
            title: 'Label',
            type: 'string',
            description: 'Text shown in the menu.',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'link',
            title: 'Link',
            type: 'link',
            description: 'Where this menu item goes.',
        }),
    ],
    preview: {
        select: { title: 'label' },
        prepare({ title }) {
            return { title: title || 'Menu Link' }
        },
    },
})
