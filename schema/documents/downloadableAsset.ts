import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'downloadableAsset',
    title: 'Downloadable Asset / Press File',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title / File Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'category',
            title: 'Category / Asset Type',
            type: 'string',
            options: {
                list: [
                    { title: 'EPK PDF', value: 'epkPdf' },
                    { title: 'Bio PDF', value: 'bioPdf' },
                    { title: 'Press Photo', value: 'pressPhoto' },
                    { title: 'Album Art', value: 'albumArt' },
                    { title: 'Logo', value: 'logo' },
                    { title: 'Tech Rider', value: 'rider' },
                    { title: 'Stage Plot', value: 'stagePlot' },
                    { title: 'Promo Clip', value: 'promoClip' },
                    { title: 'Miscellaneous', value: 'misc' },
                    { title: 'EPK (Legacy)', value: 'epk' },
                    { title: 'Press Photo (Legacy)', value: 'photo' },
                ],
                layout: 'dropdown',
            },
        }),
        defineField({
            name: 'file',
            title: 'File / Download',
            type: 'file',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'previewImage',
            title: 'Preview Image / Thumbnail',
            type: 'image',
            description: 'A thumbnail preview of the file.',
            options: { hotspot: true },
        }),
        defineField({
            name: 'usageRights',
            title: 'Usage Rights / Licensing Notes',
            type: 'text',
            rows: 3,
            description: 'Any licensing or usage restrictions.',
        }),
    ],
    preview: {
        select: { title: 'title', category: 'category', media: 'previewImage' },
        prepare({ title, category, media }) {
            const labels: Record<string, string> = {
                epkPdf: 'EPK PDF',
                bioPdf: 'Bio PDF',
                pressPhoto: 'Press Photo',
                albumArt: 'Album Art',
                logo: 'Logo',
                rider: 'Rider',
                stagePlot: 'Stage Plot',
                promoClip: 'Promo Clip',
                misc: 'Misc',
                epk: 'EPK',
                photo: 'Photo',
            }
            return {
                title: title || 'Untitled Asset',
                subtitle: labels[category || ''] || category || '',
                media,
            }
        },
    },
})
