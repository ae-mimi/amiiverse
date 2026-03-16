import { z } from "zod";

export const currencySchema = z.enum(["NGN", "USD", "GBP"]);

export const quoteRequestSchema = z.object({
    cartId: z.string().trim().min(1).max(120),
    currency: currencySchema.default("NGN"),
    country: z.string().trim().toUpperCase().length(2).default("NG"),
    region: z.string().trim().max(80).optional().default(""),
});

export const addToCartSchema = z.object({
    cartId: z.string().trim().min(1).max(120),
    variantId: z.string().trim().min(1).max(200).optional(),
    productId: z.string().trim().min(1).max(200).optional(),
    quantity: z.number().int().positive().max(999).default(1),
    currency: currencySchema.default("NGN"),
    country: z.string().trim().toUpperCase().length(2).default("NG"),
    region: z.string().trim().max(80).optional().default(""),
});

export const checkoutInitSchema = z.object({
    cartId: z.string().trim().min(1).max(120),
    firstName: z.string().trim().max(80).optional().default(""),
    lastName: z.string().trim().max(80).optional().default(""),
    email: z.string().trim().email(),
    phone: z.string().trim().max(40).optional().default(""),
    addressLine1: z.string().trim().max(180).optional().default(""),
    addressLine2: z.string().trim().max(180).optional().default(""),
    landmark: z.string().trim().max(180).optional().default(""),
    city: z.string().trim().max(120).optional().default(""),
    postcode: z.string().trim().max(30).optional().default(""),
    currency: currencySchema.default("NGN"),
    country: z.string().trim().toUpperCase().length(2).default("NG"),
    region: z.string().trim().max(80).optional().default(""),
    deliveryMethod: z.string().trim().max(80).optional().default(""),
    deliveryLabel: z.string().trim().max(120).optional().default(""),
    deliveryEstimate: z.string().trim().max(120).optional().default(""),
    deliveryPriceNgn: z.coerce.number().min(0).optional().default(0),
    quoteHash: z.string().trim().min(20).max(200),
});
