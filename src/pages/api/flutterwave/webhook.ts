import { createHash } from "node:crypto";
import type { APIRoute } from "astro";
import {
    getCloudflareRuntimeEnv,
    getServerEnvValue,
} from "../../../lib/server/cloudflareRuntimeEnv";
import { canTransitionOrderStatus } from "../../../lib/server/ecom";

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    first: () => Promise<Record<string, unknown> | null>;
    all: () => Promise<{ results?: Array<Record<string, unknown>> }>;
    run: () => Promise<Record<string, unknown>>;
}

interface D1DatabaseLike {
    prepare: (query: string) => D1PreparedStatementLike;
}

interface FlutterwaveWebhookEvent {
    id?: string;
    event?: string;
    data?: {
        id?: number | string;
        tx_ref?: string;
        status?: string;
    };
}

function constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return mismatch === 0;
}

function toBase64(bytes: Uint8Array): string {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
}

async function verifyFlutterwaveSignature(
    rawBody: string,
    signature: string,
    secretHash: string,
): Promise<boolean> {
    if (!rawBody || !signature || !secretHash) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secretHash),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const hmac = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const computed = toBase64(new Uint8Array(hmac));
    return constantTimeEquals(computed, signature);
}

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const webhookSecret = getServerEnvValue({ locals }, "FLUTTERWAVE_WEBHOOK_HASH");
        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;

        if (!webhookSecret) {
            return new Response("Missing FLUTTERWAVE_WEBHOOK_HASH", { status: 500 });
        }
        if (!db) {
            return new Response("Missing D1 binding `DB`", { status: 500 });
        }

        const rawBody = await request.text();
        const hmacSignature = String(
            request.headers.get("flutterwave-signature") || "",
        ).trim();
        const legacySignature = String(request.headers.get("verif-hash") || "").trim();
        if (!hmacSignature && !legacySignature) {
            return new Response("Missing signature", { status: 400 });
        }

        const hmacValid = hmacSignature
            ? await verifyFlutterwaveSignature(rawBody, hmacSignature, webhookSecret)
            : false;
        const legacyValid = legacySignature
            ? constantTimeEquals(legacySignature, webhookSecret)
            : false;
        if (!hmacValid && !legacyValid) {
            return new Response("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(rawBody) as FlutterwaveWebhookEvent;
        const eventName = String(event.event || "").toLowerCase();
        const txStatus = String(event.data?.status || "").toLowerCase();
        if (eventName !== "charge.completed" && txStatus !== "successful") {
            return new Response("Event ignored", { status: 200 });
        }

        const reference = String(event.data?.tx_ref || "").trim();
        if (!reference) return new Response("Missing tx_ref", { status: 400 });

        const payloadHash = createHash("sha256").update(rawBody).digest("hex");
        const eventKey = String(event.id || event.data?.id || reference).trim();
        const nowIso = new Date().toISOString();

        const dedupe = await db
            .prepare(
                `INSERT INTO webhook_events (
                    id, provider, event_key, reference, payload_hash, processed_at
                 ) VALUES (?, 'flutterwave', ?, ?, ?, ?)
                 ON CONFLICT(provider, event_key) DO NOTHING`,
            )
            .bind(
                `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                eventKey,
                reference,
                payloadHash,
                nowIso,
            )
            .run();

        const meta = dedupe as Record<string, unknown>;
        if (Number(meta?.changes ?? 0) === 0) {
            return new Response("Already processed", { status: 200 });
        }

        const order = await db
            .prepare(
                `SELECT id, cart_id, status
                 FROM orders
                 WHERE reference = ?
                 LIMIT 1`,
            )
            .bind(reference)
            .first();
        if (!order) return new Response("Order not found", { status: 404 });

        const orderId = String(order.id || "");
        const currentStatus = String(order.status || "pending_payment");
        const transactionId = String(event.data?.id ?? "").trim();

        if (canTransitionOrderStatus(currentStatus, "paid") || currentStatus === "paid") {
            await db
                .prepare(
                    `UPDATE orders
                     SET status = CASE
                         WHEN status = 'pending_payment' THEN 'fulfillment_pending'
                         ELSE status
                     END,
                         payment_provider = 'flutterwave',
                         provider_transaction_id = CASE
                             WHEN provider_transaction_id IS NULL OR provider_transaction_id = ''
                             THEN ?
                             ELSE provider_transaction_id
                         END,
                         provider_raw_json = ?,
                         updated_at = ?
                     WHERE id = ?`,
                )
                .bind(transactionId, rawBody, nowIso, orderId)
                .run();
        }

        await db
            .prepare(
                `UPDATE payments
                 SET provider_tx_id = CASE
                     WHEN provider_tx_id IS NULL OR provider_tx_id = ''
                     THEN ?
                     ELSE provider_tx_id
                 END,
                     status = 'paid',
                     raw_json = ?,
                     updated_at = ?
                 WHERE reference = ?`,
            )
            .bind(transactionId, rawBody, nowIso, reference)
            .run();

        const items = await db
            .prepare(
                `SELECT variant_id, quantity
                 FROM order_items
                 WHERE order_id = ?`,
            )
            .bind(orderId)
            .all();
        for (const item of items.results ?? []) {
            const variantId = String(item.variant_id || "").trim();
            const qty = Math.max(0, Number(item.quantity ?? 0));
            if (!variantId || qty <= 0) continue;
            await db
                .prepare(
                    `UPDATE inventory
                     SET reserved = CASE WHEN reserved >= ? THEN reserved - ? ELSE 0 END,
                         on_hand = CASE WHEN on_hand >= ? THEN on_hand - ? ELSE 0 END,
                         updated_at = ?
                     WHERE variant_id = ?`,
                )
                .bind(qty, qty, qty, qty, nowIso, variantId)
                .run();
        }

        if (order.cart_id) {
            await db
                .prepare(
                    `UPDATE carts
                     SET status = 'checked_out', updated_at = ?
                     WHERE id = ?`,
                )
                .bind(nowIso, String(order.cart_id))
                .run();
        }

        return new Response("Webhook processed", { status: 200 });
    } catch (error) {
        console.error("[flutterwave/webhook] processing error", error);
        return new Response("Webhook error", { status: 500 });
    }
};
