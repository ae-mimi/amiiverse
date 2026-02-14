import { defineField, defineType } from 'sanity'
import { ThemeIcon } from './icons'

export default defineType({
    name: 'theme',
    title: 'Era Theme',
    type: 'document',
    icon: ThemeIcon,
    groups: [
        { name: 'identity', title: 'Identity', default: true },
        { name: 'colors', title: 'Colors' },
        { name: 'typography', title: 'Typography' },
        { name: 'favicons', title: 'Favicons' },
    ],
    fields: [
        // ── Identity ─────────────────────────────────────────
        defineField({
            name: 'name',
            title: 'Era Name',
            type: 'string',
            description: 'The name of this era (e.g. "Pre-debut", "Debut", "Comeback").',
            group: 'identity',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'Auto-generated URL-safe ID. Click "Generate" after typing the era name.',
            options: { source: 'name', maxLength: 96 },
            group: 'identity',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'isActive',
            title: 'Active Era',
            type: 'boolean',
            description: 'Turn this ON to make this the default theme for new visitors. Only one era should be active at a time.',
            group: 'identity',
            initialValue: false,
        }),

        // ── Colors ───────────────────────────────────────────
        defineField({
            name: 'colors',
            title: 'Theme Colors',
            type: 'object',
            group: 'colors',
            fields: [
                defineField({
                    name: 'background',
                    title: 'Background Color',
                    type: 'string',
                    description: 'Main page background (hex code, e.g. #FDF38A).',
                    validation: (rule) => rule.regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex code like #FDF38A'),
                }),
                defineField({
                    name: 'text',
                    title: 'Text Color',
                    type: 'string',
                    description: 'Main text color (hex code, e.g. #15499D).',
                    validation: (rule) => rule.regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex code like #15499D'),
                }),
                defineField({
                    name: 'palette',
                    title: 'Color Palette',
                    type: 'array',
                    description: 'Add named colors for this era. Each one generates a full light-to-dark range automatically.',
                    of: [{
                        type: 'object',
                        name: 'colorEntry',
                        fields: [
                            defineField({
                                name: 'name',
                                title: 'Color Name',
                                type: 'string',
                                description: 'e.g. "Primary", "Accent", "Highlight"',
                                validation: (rule) => rule.required(),
                            }),
                            defineField({
                                name: 'hex',
                                title: 'Hex Code',
                                type: 'string',
                                description: 'e.g. #E44598',
                                validation: (rule) => rule.required().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex code like #E44598'),
                            }),
                        ],
                        preview: {
                            select: { title: 'name', subtitle: 'hex' },
                        },
                    }],
                }),
            ],
        }),

        // ── Typography ───────────────────────────────────────
        defineField({
            name: 'fontHeading',
            title: 'Heading Font',
            type: 'string',
            description: 'CSS font-family for headings (e.g. "Starbim", sans-serif). Must be a font that\'s already loaded on the site.',
            group: 'typography',
            initialValue: '"Starbim", sans-serif',
        }),
        defineField({
            name: 'fontBody',
            title: 'Body Font',
            type: 'string',
            description: 'CSS font-family for body text (e.g. "Archivo", sans-serif).',
            group: 'typography',
            initialValue: '"Archivo", sans-serif',
        }),
        defineField({
            name: 'buttonStyle',
            title: 'Button Shape',
            type: 'string',
            description: 'Controls how rounded the buttons look across the site.',
            group: 'typography',
            options: {
                list: [
                    { title: 'Rounded (Pill)', value: '999px' },
                    { title: 'Square', value: '0px' },
                    { title: 'Soft Corners', value: '8px' },
                ],
                layout: 'radio',
            },
            initialValue: '999px',
        }),

        // ── Favicons ─────────────────────────────────────────
        defineField({
            name: 'favicons',
            title: 'Era Favicons',
            type: 'object',
            description: 'Upload era-specific icons generated by RealFaviconGenerator. These override the global favicons when this era is active.',
            group: 'favicons',
            options: { collapsible: true, collapsed: true },
            fields: [
                defineField({ name: 'faviconIco', title: 'favicon.ico', type: 'file', options: { accept: 'image/x-icon,image/vnd.microsoft.icon' } }),
                defineField({ name: 'faviconSvg', title: 'favicon.svg', type: 'file', options: { accept: 'image/svg+xml' } }),
                defineField({ name: 'favicon96', title: 'favicon-96x96.png', type: 'image' }),
                defineField({ name: 'appleTouchIcon', title: 'Apple Touch Icon (180×180)', type: 'image' }),
                defineField({ name: 'manifest192', title: 'Web App Icon (192×192)', type: 'image' }),
                defineField({ name: 'manifest512', title: 'Web App Splash (512×512)', type: 'image' }),
            ],
        }),
    ],
    preview: {
        select: { title: 'name', active: 'isActive' },
        prepare({ title, active }) {
            return {
                title: title || 'Untitled Era',
                subtitle: active ? '✅ Active' : 'Inactive',
            }
        },
    },
})
