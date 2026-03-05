import { defineField, defineType } from 'sanity'
import { ThemeIcon } from '../icons'

export default defineType({
    name: 'themeSettings',
    title: 'Theme Settings',
    type: 'object',
    icon: ThemeIcon,
    fields: [
        defineField({
            name: 'primaryColor',
            title: 'Primary Color',
            type: 'color',
            description: 'Main brand color (e.g., used for buttons, links).',
            initialValue: { _type: 'color', hex: '#1E1E2E' },
        }),
        defineField({
            name: 'secondaryColor',
            title: 'Secondary Color',
            type: 'color',
            description: 'Secondary brand color.',
            initialValue: { _type: 'color', hex: '#FDE047' },
        }),
        defineField({
            name: 'accentColor',
            title: 'Accent Color',
            type: 'color',
            description: 'Used for highlights and accents.',
            initialValue: { _type: 'color', hex: '#FDE047' },
        }),
        defineField({
            name: 'backgroundColor',
            title: 'Background Color',
            type: 'color',
            description: 'Page background color.',
            initialValue: { _type: 'color', hex: '#FFFFFF' },
        }),
        defineField({
            name: 'textColor',
            title: 'Text Color',
            type: 'color',
            description: 'Main body text color.',
            initialValue: { _type: 'color', hex: '#1E1E2E' },
        }),
        defineField({
            name: 'mutedTextColor',
            title: 'Muted Text Color',
            type: 'color',
            description: 'Lighter text for secondary information.',
            initialValue: { _type: 'color', hex: '#64748B' },
        }),
        defineField({
            name: 'buttonStyle',
            title: 'Button Style',
            type: 'string',
            options: {
                list: [
                    { title: 'Filled', value: 'filled' },
                    { title: 'Outline', value: 'outline' },
                    { title: 'Ghost', value: 'ghost' },
                ],
                layout: 'radio',
            },
            initialValue: 'filled',
        }),
        defineField({
            name: 'borderRadiusScale',
            title: 'Border Radius',
            type: 'string',
            options: {
                list: [
                    { title: 'Small (Sharp)', value: 'small' },
                    { title: 'Medium (Rounded)', value: 'medium' },
                    { title: 'Large (Pill)', value: 'large' },
                ],
                layout: 'radio',
            },
            initialValue: 'medium',
        }),
        defineField({
            name: 'headingFont',
            title: 'Heading Font',
            type: 'string',
            description: 'Font family name for headings (must be loaded in CSS).',
            initialValue: 'Inter',
        }),
        defineField({
            name: 'bodyFont',
            title: 'Body Font',
            type: 'string',
            description: 'Font family name for body text (must be loaded in CSS).',
            initialValue: 'Inter',
        }),
    ],
})
