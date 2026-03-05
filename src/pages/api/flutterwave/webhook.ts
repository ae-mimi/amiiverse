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

        const signature = request.headers.get("verif-hash") || "";
        if (!signature) {
            return new Response("Missing signature", { status: 400 });
        }
        if (signature !== FLUTTERWAVE_WEBHOOK_HASH) {
            return new Response("Invalid signature", { status: 401 });
        }

        const rawBody = await request.text();
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
        console.error("[flutterwave/webhook] processing error", error);
        return new Response("Webhook error", { status: 500 });
    }
};
