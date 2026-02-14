import { defineField, defineType } from 'sanity'
import { MemberIcon } from './icons'

export default defineType({
    name: 'member',
    title: 'Member',
    type: 'document',
    icon: MemberIcon,
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            description: 'The member\'s display name.',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'role',
            title: 'Role',
            type: 'string',
            description: 'e.g. Vocalist, Dancer, Rapper',
        }),
        defineField({
            name: 'fact',
            title: 'Fun Fact',
            type: 'text',
            description: 'A short fun fact about this member.',
            rows: 3,
        }),
        defineField({
            name: 'image',
            title: 'Photo',
            type: 'image',
            description: 'A portrait or profile photo. Use a square or 3:4 ratio.',
            options: { hotspot: true },
            validation: (rule) => rule.required(),
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'role',
            media: 'image',
        },
    },
})
