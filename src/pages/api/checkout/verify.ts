import type { APIRoute } from "astro";
import { getServerEnvValue } from "../../../lib/server/cloudflareRuntimeEnv";

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

async function medusaRequest<T = any>(
    backendUrl: string,
    path: string,
    init: RequestInit,
): Promise<T | null> {
    if (!backendUrl) return null;

    try {
        const response = await fetch(`${backendUrl}${path}`, {
            ...init,
            headers: {
                Accept: "application/json",
                ...(init.body ? { "Content-Type": "application/json" } : {}),
                ...(init.headers ?? {}),
            },
        });

        if (!response.ok) return null;
        return (await response.json()) as T;
    } catch (error) {
        console.error("[checkout/verify] Medusa request failed", error);
        return null;
    }
}

export const GET: APIRoute = async ({ url, locals }) => {
    const MEDUSA_BACKEND_URL = getServerEnvValue(
        { locals },
        "PUBLIC_MEDUSA_BACKEND_URL",
    ).replace(/\/+$/, "");
    const PAYSTACK_SECRET_KEY = getServerEnvValue(
        { locals },
        "PAYSTACK_SECRET_KEY",
    );

    const reference = url.searchParams.get("reference") || "";
    const cartId = url.searchParams.get("cartId") || "";

    if (!reference) {
        return jsonResponse({ status: "no_reference" }, 400);
    }

    if (!PAYSTACK_SECRET_KEY) {
        return jsonResponse({ error: "Missing PAYSTACK_SECRET_KEY" }, 500);
    }

    try {
        const paystackResponse = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            },
        );

        const paystackData = await paystackResponse.json();
        const paystackStatus = paystackData?.data?.status;

        if (!paystackResponse.ok || !paystackData?.status) {
            return jsonResponse({
                status: "error",
                message: paystackData?.message || "Paystack verification failed",
            });
        }

        if (paystackStatus !== "success") {
            return jsonResponse({
                status: "failed",
                reference,
                paystackStatus,
            });
        }

        let medusaCart: any = null;
        if (cartId) {
            const cartResponse = await medusaRequest<{ cart?: any }>(
                MEDUSA_BACKEND_URL,
                `/store/carts/${encodeURIComponent(cartId)}`,
                { method: "GET" },
            );
            medusaCart = cartResponse?.cart ?? null;

            if (medusaCart && !medusaCart.order_id && !medusaCart.completed_at) {
                await medusaRequest(
                    MEDUSA_BACKEND_URL,
                    `/store/carts/${encodeURIComponent(cartId)}/complete`,
                    {
                        method: "POST",
                        body: JSON.stringify({}),
                    },
                );

                const refreshed = await medusaRequest<{ cart?: any }>(
                    MEDUSA_BACKEND_URL,
                    `/store/carts/${encodeURIComponent(cartId)}`,
                    { method: "GET" },
                );
                medusaCart = refreshed?.cart ?? medusaCart;
            }
        }

        const isMedusaConfirmed = Boolean(
            medusaCart?.order_id || medusaCart?.completed_at,
        );

        return jsonResponse({
            status: isMedusaConfirmed ? "paid" : "pending",
            reference,
            paystackStatus,
            email: paystackData?.data?.customer?.email || medusaCart?.email || "",
            amount:
                paystackData?.data?.amount ??
                medusaCart?.total ??
                medusaCart?.subtotal ??
                0,
            currency:
                paystackData?.data?.currency ||
                medusaCart?.currency_code ||
                "NGN",
            medusa: {
                cartId: medusaCart?.id || cartId || null,
                orderId: medusaCart?.order_id || null,
                completedAt: medusaCart?.completed_at || null,
            },
        });
    } catch (error: any) {
        console.error("[checkout/verify] Unexpected error", error);
        return jsonResponse(
            { status: "error", message: error?.message || "Verification failed" },
            500,
        );
    }
};
