import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'theme',
    title: 'Era Theme',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Era Name',
            type: 'string',
            description: 'e.g., Pre-debut, Debut',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'colors',
            title: 'Theme Colors',
            type: 'object',
            fields: [
                defineField({ name: 'background', title: 'Background Color', type: 'string', description: 'Hex code (e.g., #FDF38A)' }),
                defineField({ name: 'text', title: 'Text Color', type: 'string', description: 'Hex code (e.g., #15499D)' }),
                defineField({
                    name: 'palette',
                    title: 'Color Palette',
                    type: 'array',
                    description: 'Add colors here (Primary, Secondary, Accent, etc.). Each will generate a full 100-900 ramp.',
                    of: [{
                        type: 'object',
                        name: 'colorEntry',
                        fields: [
                            defineField({ name: 'name', title: 'Color Name', type: 'string', description: 'e.g., "Primary", "Accent 1". Used for variable name.', validation: (rule) => rule.required() }),
                            defineField({ name: 'hex', title: 'Hex Code', type: 'string', validation: (rule) => rule.required().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex code') }),
                        ],
                        preview: {
                            select: { title: 'name', subtitle: 'hex' },
                        }
                    }]
                }),
            ],
        }),
        defineField({
            name: 'favicon',
            title: 'Favicon',
            type: 'file',
            options: {
                accept: 'image/x-icon,image/vnd.microsoft.icon,image/png,image/jpeg,image/svg+xml',
            },
            description: 'Upload the favicon for this era (PNG/ICO).',
        }),
        defineField({
            name: 'fontHeading',
            title: 'Heading Font Family',
            type: 'string',
            description: 'CSS font-family value (e.g., "Starbim", sans-serif)',
            initialValue: '"Starbim", sans-serif',
        }),
        defineField({
            name: 'fontBody',
            title: 'Body Font Family',
            type: 'string',
            description: 'CSS font-family value (e.g., "Archivo", sans-serif)',
            initialValue: '"Archivo", sans-serif',
        }),
        defineField({
            name: 'buttonStyle',
            title: 'Button Style',
            type: 'string',
            options: {
                list: [
                    { title: 'Rounded (Pill)', value: '999px' },
                    { title: 'Square', value: '0px' },
                    { title: 'Soft (8px)', value: '8px' },
                ],
            },
            initialValue: '999px',
        }),
        defineField({
            name: 'isActive',
            title: 'Set as Active Era',
            type: 'boolean',
            description: 'If checked, this will be the default theme for new visitors.',
            initialValue: false,
        }),
    ],
})
