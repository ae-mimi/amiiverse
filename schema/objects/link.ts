import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'link',
    title: 'Link',
    type: 'object',
    fields: [
        defineField({
            name: 'label',
            title: 'Label',
            type: 'string',
            description: 'The text displayed on the link or button.',
        }),
        defineField({
            name: 'type',
            title: 'Link Type',
            type: 'string',
            description: 'What kind of link is this?',
            options: {
                list: [
                    { title: 'Internal Page', value: 'internal' },
                    { title: 'External URL', value: 'external' },
                    { title: 'File Download', value: 'download' },
                    { title: 'Email', value: 'email' },
                    { title: 'Phone', value: 'phone' },
                ],
                layout: 'radio',
            },
            initialValue: 'external',
        }),
        defineField({
            name: 'internalRef',
            title: 'Internal Page',
            type: 'reference',
            to: [{ type: 'page' }],
            description: 'Select a page on this site.',
            hidden: ({ parent }) => parent?.type !== 'internal',
        }),
        defineField({
            name: 'url',
            title: 'URL / Email / Phone',
            type: 'url',
            description: 'Full URL, email address, mailto link, phone number, or tel link.',
            hidden: ({ parent }) => !['external', 'email', 'phone'].includes(parent?.type),
            validation: (rule) =>
                rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
        }),
        defineField({
            name: 'file',
            title: 'File',
            type: 'file',
            description: 'Upload a file for visitors to download.',
            hidden: ({ parent }) => parent?.type !== 'download',
        }),
        defineField({
            name: 'newTab',
            title: 'Open in New Tab',
            type: 'boolean',
            description: 'Should this link open in a new browser tab?',
            initialValue: false,
        }),
    ],
    preview: {
        select: { title: 'label', type: 'type', url: 'url' },
        prepare({ title, type, url }) {
            return {
                title: title || 'Untitled Link',
                subtitle: type === 'external' ? url || 'No URL' : type || '',
            }
        },
    },
})
