import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'settings',
    title: 'Global Settings',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Site Title',
            type: 'string',
        }),
        defineField({
            name: 'description',
            title: 'Site Description',
            type: 'text',
        }),
        defineField({
            name: 'enable_follow_link',
            title: 'Enable Follow Link',
            type: 'boolean',
        }),
        defineField({
            name: 'logo_navy',
            title: 'Logo (Navy)',
            type: 'image',
        }),
        defineField({
            name: 'logo_yellow',
            title: 'Logo (Yellow)',
            type: 'image',
        }),
        defineField({
            name: 'favicon',
            title: 'Favicon',
            type: 'image',
        }),
        defineField({
            name: 'nav',
            title: 'Navigation Links',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'label', type: 'string' },
                        { name: 'href', type: 'string' },
                    ],
                },
            ],
        }),
        defineField({
            name: 'footer',
            title: 'Footer Settings',
            type: 'object',
            fields: [
                defineField({
                    name: 'copyright',
                    title: 'Copyright Text',
                    type: 'string',
                }),
                defineField({
                    name: 'links',
                    title: 'Footer Links',
                    type: 'array',
                    of: [
                        {
                            type: 'object',
                            fields: [
                                { name: 'label', type: 'string' },
                                { name: 'href', type: 'string' },
                                { name: 'is_special', type: 'boolean', title: 'Is Special?' },
                                { name: 'disabled', type: 'boolean', title: 'Is Disabled?' },
                            ],
                        },
                    ],
                }),
            ],
        }),
        defineField({
            name: 'socials',
            title: 'Social Media Links',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'platform', type: 'string' },
                        { name: 'url', type: 'url' },
                        {
                            name: 'icon',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'TikTok', value: 'tiktok' },
                                    { title: 'Instagram', value: 'instagram' },
                                    { title: 'YouTube', value: 'youtube' },
                                    { title: 'Twitter', value: 'twitter' },
                                    { title: 'Facebook', value: 'facebook' },
                                ],
                            },
                        },
                    ],
                },
            ],
        }),
    ],
})
