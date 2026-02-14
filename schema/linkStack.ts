import { defineField, defineType } from 'sanity'
import { LinkStackIcon } from './icons'

export default defineType({
    name: 'link_stack',
    title: 'Link Buttons',
    type: 'object',
    icon: LinkStackIcon,
    description: 'A vertical stack of buttons linking to your socials, music, merch, and more — the core of your Follow / Link-in-Bio page.',
    fields: [
        defineField({
            name: 'links',
            title: 'Buttons',
            type: 'array',
            description: 'Add links here. Each one becomes a button visitors can tap. Drag to reorder.',
            of: [
                {
                    type: 'object',
                    title: 'Link Button',
                    fields: [
                        defineField({
                            name: 'label',
                            type: 'string',
                            title: 'Button Text',
                            description: 'What the button says (e.g. "Listen on Spotify", "Shop Merch").',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'url',
                            type: 'url',
                            title: 'Link URL',
                            description: 'Where the button leads — paste the full URL.',
                            validation: (rule) => rule.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
                        }),
                        defineField({
                            name: 'icon',
                            type: 'string',
                            title: 'Emoji Icon',
                            description: 'An emoji shown before the text (e.g. 🎵 🛒 📸). Leave empty for no icon.',
                        }),
                        defineField({
                            name: 'type',
                            title: 'Button Style',
                            type: 'string',
                            description: 'How the button looks.',
                            options: {
                                list: [
                                    { title: 'Outline (transparent with border)', value: 'default' },
                                    { title: 'Filled (solid background)', value: 'primary' },
                                    { title: 'Filled Alt (alternate solid)', value: 'secondary' },
                                ],
                                layout: 'radio',
                            },
                            initialValue: 'default',
                        }),
                    ],
                    preview: {
                        select: { title: 'label', url: 'url', icon: 'icon', type: 'type' },
                        prepare({ title, url, icon, type }) {
                            const styleLabel = { default: 'Outline', primary: 'Filled', secondary: 'Filled Alt' }[(type || 'default') as 'default' | 'primary' | 'secondary']
                            return {
                                title: icon ? `${icon} ${title || 'Link'}` : title || 'Link',
                                subtitle: `${styleLabel} · ${url || 'No URL'}`,
                            }
                        },
                    },
                },
            ],
        }),
    ],
    preview: {
        select: { links: 'links' },
        prepare({ links }) {
            const count = links?.length || 0
            return {
                title: 'Link Buttons',
                subtitle: `${count} button${count !== 1 ? 's' : ''}`,
            }
        },
    },
})
