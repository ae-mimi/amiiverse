import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'link_stack',
    title: 'Link Stack',
    type: 'object',
    fields: [
        defineField({
            name: 'links',
            title: 'Links',
            type: 'array',
            of: [
                {
                    type: 'object',
                    title: 'Link',
                    fields: [
                        { name: 'label', type: 'string', title: 'Label' },
                        { name: 'url', type: 'url', title: 'URL', validation: Rule => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }) },
                        { name: 'icon', type: 'string', title: 'Icon (Emoji)' },
                        {
                            name: 'type',
                            title: 'Style Type',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Default (Transparent)', value: 'default' },
                                    { title: 'Primary (Navy/Yellow)', value: 'primary' },
                                    { title: 'Secondary (Navy/Yellow Border)', value: 'secondary' },
                                ],
                            },
                            initialValue: 'default',
                        },
                    ],
                    preview: {
                        select: {
                            title: 'label',
                            subtitle: 'url',
                            type: 'type',
                        },
                        prepare({ title, subtitle, type }) {
                            return {
                                title: title || 'Link',
                                subtitle: `${subtitle} (${type})`,
                            }
                        },
                    },
                },
            ],
        }),
    ],
    preview: {
        select: {
            links: 'links',
        },
        prepare({ links }) {
            return {
                title: 'Link Stack',
                subtitle: `${links?.length || 0} links`,
            }
        },
    },
})
