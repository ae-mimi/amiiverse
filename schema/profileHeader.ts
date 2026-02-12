import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'profile_header',
    title: 'Profile Header (Follow)',
    type: 'object',
    fields: [
        defineField({
            name: 'avatar',
            title: 'Avatar Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'handle',
            title: 'Handle',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'bio',
            title: 'Bio',
            type: 'text',
            rows: 3,
        }),
    ],
    preview: {
        select: {
            title: 'handle',
            media: 'avatar',
        },
        prepare({ title, media }) {
            return {
                title: title || 'Profile Header',
                media: media,
            }
        },
    },
})
