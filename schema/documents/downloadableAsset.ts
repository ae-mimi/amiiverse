import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'downloadableAsset',
    title: 'Downloadable Asset',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'EPK (Press Kit)', value: 'epk' },
                    { title: 'Logo', value: 'logo' },
                    { title: 'Press Photo', value: 'photo' },
                    { title: 'Tech Rider', value: 'rider' },
                    { title: 'Stage Plot', value: 'stagePlot' },
                    { title: 'Miscellaneous', value: 'misc' },
                ],
                layout: 'dropdown',
            },
        }),
        defineField({
            name: 'file',
            title: 'File',
            type: 'file',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'previewImage',
            title: 'Preview Image',
            type: 'image',
            description: 'A thumbnail preview of the file.',
            options: { hotspot: true },
        }),
        defineField({
            name: 'usageRights',
            title: 'Usage Rights',
            type: 'text',
            rows: 3,
            description: 'Any licensing or usage restrictions.',
        }),
    ],
    preview: {
        select: { title: 'title', category: 'category', media: 'previewImage' },
        prepare({ title, category, media }) {
            const labels: Record<string, string> = { epk: 'EPK', logo: 'Logo', photo: 'Photo', rider: 'Rider', stagePlot: 'Stage Plot', misc: 'Misc' }
            return {
                title: title || 'Untitled Asset',
                subtitle: labels[category || ''] || category || '',
                media,
            }
        },
    },
})
