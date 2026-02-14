import type { APIRoute } from 'astro';
import { sanityWriteClient } from '../../../lib/sanity/client';

const PAYSTACK_SECRET_KEY = import.meta.env.PAYSTACK_SECRET_KEY;

export const POST: APIRoute = async ({ request }: { request: Request }) => {
    try {
        const body = await request.json();
        const { productId, email, firstName, lastName, phone, quantity = 1 } = body;

        if (!productId || !email || !firstName || !lastName || !phone) {
            return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
        }

        // 2. Fetch Product from Sanity
        const product = await sanityWriteClient.fetch(`*[_id == $productId][0]{ title, price, isActive, "productId": _id }`, { productId });

        if (!product || !product.isActive) {
            return new Response(JSON.stringify({ error: 'Product not found or inactive' }), { status: 404 });
        }

        const amountInKobo = Math.round(product.price * 100) * quantity;
        const totalAmount = product.price * quantity;

        // 3. Generate reference
        const reference = `amii_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        // 4. Create Order in Sanity
        const order = await sanityWriteClient.create({
            _type: 'order',
            reference,
            customerName: `${firstName} ${lastName}`,
            email,
            phone,
            amount: totalAmount,
            status: 'pending',
            productSnapshot: {
                title: product.title,
                price: product.price,
                productId: product.productId
            },
            createdAt: new Date().toISOString()
        });

        // 5. Initialize Paystack Transaction
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                amount: amountInKobo,
                reference,
                callback_url: `${new URL(request.url).origin}/shop/success`,
                metadata: {
                    orderId: order._id,
                    productId
                }
            })
        });

        const paystackData = await paystackResponse.json();

        if (!paystackData.status) {
            throw new Error(paystackData.message || 'Paystack initialization failed');
        }

        return new Response(JSON.stringify({
            authorization_url: paystackData.data.authorization_url,
            reference
        }), { status: 200 });

    } catch (error: any) {
        console.error('[Paystack Init Error]:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
