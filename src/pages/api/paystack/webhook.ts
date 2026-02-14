import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import { sanityWriteClient } from '../../../lib/sanity/client';

const PAYSTACK_SECRET_KEY = import.meta.env.PAYSTACK_SECRET_KEY;

export const POST: APIRoute = async ({ request }) => {
    try {
        const signature = request.headers.get('x-paystack-signature');
        if (!signature) {
            return new Response('Missing signature', { status: 400 });
        }

        const bodyText = await request.text();
        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(bodyText)
            .digest('hex');

        if (hash !== signature) {
            return new Response('Invalid signature', { status: 401 });
        }

        const event = JSON.parse(bodyText);

        if (event.event === 'charge.success') {
            const { reference, metadata } = event.data;

            // Update Sanity order to paid
            const orders = await sanityWriteClient.fetch(
                `*[_type == "order" && reference == $reference]`,
                { reference }
            );

            if (orders.length > 0 && orders[0].status !== 'paid') {
                const orderId = orders[0]._id;
                await sanityWriteClient
                    .patch(orderId)
                    .set({
                        status: 'paid',
                        paystackResponse: { data: JSON.stringify(event.data) }
                    })
                    .commit();

                console.log(`[Webhook] Order ${reference} marked as paid`);
            }
        }

        return new Response('Webhook processed', { status: 200 });
    } catch (error: any) {
        console.error('[Webhook Error]:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
