import { defineField, defineType } from 'sanity'
import { ShopIcon } from './icons'

export default defineType({
    name: 'shop',
    title: 'Shop Item',
    type: 'document',
    icon: ShopIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Product Name',
            type: 'string',
            description: 'The name of the product as it will appear on the website.',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'string',
            description: 'Display price (e.g. "$25.00" or "Free").',
        }),
        defineField({
            name: 'image',
            title: 'Product Image',
            type: 'image',
            description: 'A photo of the product. Square images work best.',
            options: { hotspot: true },
        }),
        defineField({
            name: 'url',
            title: 'Shop Link',
            type: 'url',
            description: 'Where to buy this product (external store link).',
            validation: (rule) => rule.required(),
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
