import { defineField, defineType } from 'sanity'
import { ProfileIcon } from './icons'

export default defineType({
    name: 'profile_header',
    title: 'Profile Header',
    type: 'object',
    icon: ProfileIcon,
    description: 'The top section of your Follow / Link-in-Bio page — your profile picture, username, and a short bio.',
    fields: [
        defineField({
            name: 'avatar',
            title: 'Profile Picture',
            type: 'image',
            description: 'A square photo of your group or logo — appears as a circle on the page.',
            options: { hotspot: true },
        }),
        defineField({
            name: 'handle',
            title: 'Username / Handle',
            type: 'string',
            description: 'Your social handle or group name (e.g. "@amiiverse").',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'bio',
            title: 'Short Bio',
            type: 'text',
            rows: 3,
            description: 'A brief description — who you are, what you do. Keep it to 1–2 lines.',
        }),
    ],
    preview: {
        select: { title: 'handle', media: 'avatar' },
        prepare({ title, media }) {
            return {
                title: title || 'Profile Header',
                subtitle: 'Follow page header',
                media,
            }
        },
    },
})
