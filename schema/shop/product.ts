import { defineField, defineType } from 'sanity'
import { ShopIcon } from '../icons'

export default defineType({
    name: 'product',
    title: 'Product',
    type: 'document',
    icon: ShopIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Long Description',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'price',
            title: 'Price (NGN)',
            type: 'number',
            description: 'Product price in Nigerian Naira.',
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: 'coverImage',
            title: 'Cover Image',
            type: 'image',
            options: { hotspot: true },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'galleryImages',
            title: 'Gallery Images',
            type: 'array',
            of: [{ type: 'image', options: { hotspot: true } }],
        }),
        defineField({
            name: 'productType',
            title: 'Product Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Physical', value: 'physical' },
                    { title: 'Digital', value: 'digital' },
                ],
                layout: 'radio',
            },
            initialValue: 'physical',
        }),
        defineField({
            name: 'digitalFile',
            title: 'Digital File',
            type: 'file',
            hidden: ({ document }) => document?.productType !== 'digital',
        }),
        defineField({
            name: 'stock',
            title: 'Stock',
            type: 'number',
            description: 'Available quantity (optional for digital products).',
            validation: (Rule) => Rule.min(0),
        }),
        defineField({
            name: 'shortDescription',
            title: 'Short Description',
            type: 'string',
            description: 'Used for the quick preview modal and the short intro on the product page.',
            validation: (Rule) => Rule.max(220).warning('Keep it concise for preview surfaces.'),
        }),
        defineField({
            name: 'compareAtPrice',
            title: 'Compare At Price (NGN)',
            type: 'number',
            description: 'Original price before discount.',
            validation: (Rule) => Rule.min(0),
        }),
        defineField({
            name: 'badges',
            title: 'Badges',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: 'New', value: 'new' },
                    { title: 'Limited', value: 'limited' },
                    { title: 'Bestseller', value: 'bestseller' },
                ],
            },
        }),
        defineField({
            name: 'isFeatured',
            title: 'Featured Product',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'sortOrder',
            title: 'Sort Order',
            type: 'number',
            description: 'Order of appearance in lists (lower numbers first).',
        }),
        defineField({
            name: 'isActive',
            title: 'Active',
            type: 'boolean',
            description: 'Whether this product is visible and purchasable in the shop.',
            initialValue: true,
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            readOnly: true,
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'price',
            media: 'coverImage',
        },
        prepare({ title, subtitle, media }) {
            return {
                title,
                subtitle: subtitle ? `₦${subtitle}` : 'No price set',
                media,
            }
        },
    },
})
