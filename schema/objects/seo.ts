import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'seo',
    title: 'SEO Settings',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'SEO Title',
            type: 'string',
            description: 'Page title for search engines and browser tab. Keep between 50–60 characters.',
            validation: (rule) => rule.max(70),
        }),
        defineField({
            name: 'description',
            title: 'SEO Description',
            type: 'text',
            rows: 3,
            description: 'Short summary for search results. Keep between 120–160 characters.',
            validation: (rule) => rule.max(200),
        }),
        defineField({
            name: 'ogImage',
            title: 'Social Share Image',
            type: 'image',
            description: 'Image shown when this page is shared on social media. Recommended size: 1200×630.',
            options: { hotspot: true },
        }),
        defineField({
            name: 'noIndex',
            title: 'Hide from Search Engines',
            type: 'boolean',
            description: 'Turn ON to prevent Google and other search engines from indexing this page.',
            initialValue: false,
        }),
        defineField({
            name: 'canonicalUrl',
            title: 'Canonical URL',
            type: 'url',
            description: 'If this page also exists at another URL, paste the "main" URL here to avoid duplicate content.',
        }),
    ],
})
