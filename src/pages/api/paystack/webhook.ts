import type { APIRoute } from "astro";
import {
    getCloudflareRuntimeEnv,
    getServerEnvValue,
} from "../../../lib/server/cloudflareRuntimeEnv";

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    first: () => Promise<Record<string, unknown> | null>;
    run: () => Promise<Record<string, unknown>>;
}

interface D1DatabaseLike {
    prepare: (query: string) => D1PreparedStatementLike;
}

interface PaystackWebhookEvent {
    event?: string;
    data?: {
        id?: number | string;
        reference?: string;
        status?: string;
    };
}

function toHex(bytes: Uint8Array): string {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) return false;

    let mismatch = 0;
    for (let i = 0; i < a.length; i += 1) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return mismatch === 0;
}

async function verifySignature(
    rawBody: string,
    signature: string,
    paystackSecretKey: string,
): Promise<boolean> {
    if (!paystackSecretKey) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(paystackSecretKey),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"],
    );

    const hmac = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const expectedSignature = toHex(new Uint8Array(hmac));

    return constantTimeEquals(expectedSignature, signature.toLowerCase());
}

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const PAYSTACK_SECRET_KEY = getServerEnvValue(
            { locals },
            "PAYSTACK_SECRET_KEY",
        );
        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;

        if (!PAYSTACK_SECRET_KEY) {
            return new Response("Missing PAYSTACK_SECRET_KEY", { status: 500 });
        }
        if (!db) {
            return new Response("Missing D1 binding `DB`", { status: 500 });
        }

        const signature = request.headers.get("x-paystack-signature") || "";
        if (!signature) {
            return new Response("Missing signature", { status: 400 });
        }

        const rawBody = await request.text();
        if (!(await verifySignature(rawBody, signature, PAYSTACK_SECRET_KEY))) {
            return new Response("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(rawBody) as PaystackWebhookEvent;
        if (String(event.event || "") !== "charge.success") {
            return new Response("Event ignored", { status: 200 });
        }

        const reference = String(event.data?.reference || "").trim();
        if (!reference) {
            return new Response("Missing transaction reference", { status: 400 });
        }

        const transactionId = String(event.data?.id ?? "").trim();
        const nowIso = new Date().toISOString();

        await db
            .prepare(
                `UPDATE orders
                 SET status = 'paid',
                     payment_provider = 'paystack',
                     provider_transaction_id = CASE
                         WHEN provider_transaction_id IS NULL OR provider_transaction_id = ''
                         THEN ?
                         ELSE provider_transaction_id
                     END,
                     paystack_transaction_id = CASE
                         WHEN paystack_transaction_id IS NULL OR paystack_transaction_id = ''
                         THEN ?
                         ELSE paystack_transaction_id
                     END,
                     provider_raw_json = ?,
                     paystack_raw_json = ?,
                     updated_at = ?
                 WHERE reference = ? AND status != 'paid'`,
            )
            .bind(transactionId, transactionId, rawBody, rawBody, nowIso, reference)
            .run();

        const orderRow = await db
            .prepare(
                `SELECT cart_id
                 FROM orders
                 WHERE reference = ?
                 LIMIT 1`,
            )
            .bind(reference)
            .first();

        if (orderRow?.cart_id) {
            await db
                .prepare(
                    `UPDATE carts
                     SET status = 'checked_out', updated_at = ?
                     WHERE id = ?`,
                )
                .bind(nowIso, String(orderRow.cart_id))
                .run();
        }

        return new Response("Webhook processed", { status: 200 });
    } catch (error) {
        console.error("[paystack/webhook] processing error", error);
        return new Response("Webhook error", { status: 500 });
    }
};
