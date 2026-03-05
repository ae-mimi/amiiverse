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

interface FlutterwaveWebhookEvent {
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
    for (let i = 0; i < a.length; i += 1) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
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
        const FLUTTERWAVE_WEBHOOK_HASH = getServerEnvValue(
            { locals },
            "FLUTTERWAVE_WEBHOOK_HASH",
        );
        const runtimeEnv = getCloudflareRuntimeEnv({ locals });
        const db = runtimeEnv.DB as D1DatabaseLike | undefined;

        if (!FLUTTERWAVE_WEBHOOK_HASH) {
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

        const hasSignature = Boolean(hmacSignature || legacySignature);
        if (!hasSignature) {
            return new Response("Missing signature", { status: 400 });
        }

        const hmacValid = hmacSignature
            ? await verifyFlutterwaveSignature(
                  rawBody,
                  hmacSignature,
                  FLUTTERWAVE_WEBHOOK_HASH,
              )
            : false;
        const legacyValid = legacySignature
            ? constantTimeEquals(legacySignature, FLUTTERWAVE_WEBHOOK_HASH)
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
        if (!reference) {
            return new Response("Missing transaction reference", { status: 400 });
        }

        const transactionId = String(event.data?.id ?? "").trim();
        const nowIso = new Date().toISOString();

        await db
            .prepare(
                `UPDATE orders
                 SET status = 'paid',
                     payment_provider = 'flutterwave',
                     provider_transaction_id = CASE
                         WHEN provider_transaction_id IS NULL OR provider_transaction_id = ''
                         THEN ?
                         ELSE provider_transaction_id
                     END,
                     provider_raw_json = ?,
                     updated_at = ?
                 WHERE reference = ? AND status != 'paid'`,
            )
            .bind(transactionId, rawBody, nowIso, reference)
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
        console.error("[flutterwave/webhook] processing error", error);
        return new Response("Webhook error", { status: 500 });
    }
};
