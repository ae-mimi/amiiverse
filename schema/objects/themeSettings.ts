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
            title: 'Primary Brand Color (Headers, Borders, UI Accents)',
            type: 'color',
            description: 'Used widely across key UI surfaces like headings, borders, and brand-forward elements.',
            initialValue: { _type: 'color', hex: '#1E1E2E' },
        }),
        defineField({
            name: 'secondaryColor',
            title: 'Secondary Brand Color (Contrast Text/Elements)',
            type: 'color',
            description: 'Typically used as a contrast color against primary surfaces.',
            initialValue: { _type: 'color', hex: '#FDE047' },
        }),
        defineField({
            name: 'accentColor',
            title: 'Accent Color (Highlights, Badges, Callouts)',
            type: 'color',
            description: 'Used for highlights and accents.',
            initialValue: { _type: 'color', hex: '#FDE047' },
        }),
        defineField({
            name: 'backgroundColor',
            title: 'Page Background Color',
            type: 'color',
            description: 'Page background color.',
            initialValue: { _type: 'color', hex: '#FFFFFF' },
        }),
        defineField({
            name: 'textColor',
            title: 'Main Text Color',
            type: 'color',
            description: 'Main body text color.',
            initialValue: { _type: 'color', hex: '#1E1E2E' },
        }),
        defineField({
            name: 'mutedTextColor',
            title: 'Muted Text Color (Secondary Copy)',
            type: 'color',
            description: 'Lighter text for secondary information.',
            initialValue: { _type: 'color', hex: '#64748B' },
        }),
        defineField({
            name: 'customPalette',
            title: 'Custom Palette Mappings',
            type: 'array',
            description: 'Add labeled custom colors and map each one to a specific UI target (buttons, inputs, links, underlines).',
            of: [
                defineField({
                    name: 'item',
                    title: 'Custom Color',
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'label',
                            title: 'Label',
                            type: 'string',
                            description: 'Internal name shown in Studio, e.g. "BUTTON COLOUR".',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'target',
                            title: 'Apply To',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Buttons - Background', value: 'buttonBg' },
                                    { title: 'Buttons - Text', value: 'buttonText' },
                                    { title: 'Inputs - Border', value: 'inputBorder' },
                                    { title: 'Inputs - Text', value: 'inputText' },
                                    { title: 'Links - Text', value: 'linkText' },
                                    { title: 'Underlines - Link Decoration', value: 'underline' },
                                ],
                                layout: 'dropdown',
                            },
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'color',
                            title: 'Color Value',
                            type: 'color',
                            validation: (rule) => rule.required(),
                        }),
                    ],
                    preview: {
                        select: {
                            title: 'label',
                            subtitle: 'target',
                            colorHex: 'color.hex',
                        },
                        prepare({ title, subtitle, colorHex }) {
                            return {
                                title: title || 'Custom Color',
                                subtitle: `${subtitle || 'target'}${colorHex ? ` - ${colorHex}` : ''}`,
                            }
                        },
                    },
                }),
            ],
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
