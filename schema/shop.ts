import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'shop',
    title: 'Shop Item',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Product Name',
            type: 'string',
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'string',
        }),
        defineField({
            name: 'image',
            title: 'Product Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'url',
            title: 'Shop URL',
            type: 'url',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'price',
            media: 'image',
        },
    },
})
