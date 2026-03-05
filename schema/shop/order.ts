import { defineField, defineType } from 'sanity'
import { ShopIcon } from '../icons'

export default defineType({
    name: 'order',
    title: 'Order',
    type: 'document',
    icon: ShopIcon,
    fields: [
        defineField({
            name: 'reference',
            title: 'Payment Reference',
            type: 'string',
            validation: (Rule) => Rule.required(),
            readOnly: true,
        }),
        defineField({
            name: 'email',
            title: 'Customer Email',
            type: 'string',
            validation: (Rule) => Rule.required().email(),
        }),
        defineField({
            name: 'productSnapshot',
            title: 'Product Snapshot',
            type: 'object',
            fields: [
                defineField({ name: 'title', type: 'string', title: 'Product Title' }),
                defineField({ name: 'price', type: 'number', title: 'Price (NGN)' }),
                defineField({ name: 'productType', type: 'string', title: 'Product Type' }),
            ],
            description: 'Snaphot of the product at the time of purchase.',
        }),
        defineField({
            name: 'amount',
            title: 'Amount Paid (NGN)',
            type: 'number',
        }),
        defineField({
            name: 'status',
            title: 'Order Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Paid', value: 'paid' },
                    { title: 'Failed', value: 'failed' },
                ],
                layout: 'dropdown',
            },
            initialValue: 'pending',
        }),
        defineField({
            name: 'paymentResponse',
            title: 'Flutterwave Response',
            type: 'object',
            options: {
                collapsed: true,
                collapsible: true,
            },
            fields: [
                { name: 'data', type: 'text', title: 'Raw Response Data' }
            ],
            description: 'The raw response received from Flutterwave API.',
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
            title: 'reference',
            subtitle: 'email',
            status: 'status',
        },
        prepare({ title, subtitle, status }) {
            const statusEmoji = status === 'paid' ? '✅' : status === 'failed' ? '❌' : '⏳'
            return {
                title: `Order: ${title}`,
                subtitle: `${statusEmoji} ${subtitle}`,
            }
        },
    },
})
