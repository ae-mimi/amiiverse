import {
    getCloudflareRuntimeEnv,
    type CloudflareRuntimeEnv,
} from "./cloudflareRuntimeEnv";
import type { APIContext } from "astro";

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    all: () => Promise<{ results?: Array<Record<string, unknown>> }>;
    first: () => Promise<Record<string, unknown> | null>;
    run: () => Promise<Record<string, unknown>>;
}

export interface D1DatabaseLike {
    prepare: (query: string) => D1PreparedStatementLike;
}

export interface CartItemDto {
    id: string;
    product_id: string;
    variant_id: string;
    sku: string;
    quantity: number;
    unit_price: number;
    unit_price_minor: number;
    total: number;
    title: string;
    thumbnail: string;
    currency: string;
    metadata: {
        productType: "physical" | "digital";
    };
}

export interface CartDto {
    id: string;
    email: string | null;
    status: "open" | "checked_out" | "abandoned";
    currency_code: string;
    country: string;
    region: string;
    subtotal: number;
    total: number;
    items: CartItemDto[];
}

export function jsonResponse(
    body: Record<string, unknown>,
    status = 200,
): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export function getD1FromContext(
    context: Pick<APIContext, "locals">,
): D1DatabaseLike | null {
    const runtimeEnv: CloudflareRuntimeEnv = getCloudflareRuntimeEnv(context);
    return (runtimeEnv.DB as D1DatabaseLike | undefined) ?? null;
}

export function createId(prefix: string): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return `${prefix}_${crypto.randomUUID()}`;
    }
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getCartDto(
    db: D1DatabaseLike,
    cartId: string,
): Promise<CartDto | null> {
    const cart = await db
        .prepare(
            `SELECT id, email, status, currency, country, region
             FROM carts
             WHERE id = ?
             LIMIT 1`,
        )
        .bind(cartId)
        .first();

    if (!cart) return null;

    const itemRowsResult = await db
        .prepare(
            `SELECT
                id,
                product_id,
                variant_id,
                sku_snapshot,
                quantity,
                unit_price_ngn,
                currency_code,
                title_snapshot,
                product_type_snapshot,
                cover_image_snapshot
             FROM cart_items
             WHERE cart_id = ?
             ORDER BY rowid DESC`,
        )
        .bind(cartId)
        .all();

    const itemRows = itemRowsResult.results ?? [];
    const items: CartItemDto[] = itemRows.map((row) => {
        const quantity = Number(row.quantity ?? 0);
        const unitPrice = Number(row.unit_price_ngn ?? 0);
        return {
            id: String(row.id ?? ""),
            product_id: String(row.product_id ?? ""),
            variant_id: String(row.variant_id ?? row.product_id ?? ""),
            sku: String(row.sku_snapshot ?? ""),
            quantity,
            unit_price: unitPrice,
            unit_price_minor: unitPrice,
            total: quantity * unitPrice,
            title: String(row.title_snapshot ?? "Product"),
            thumbnail: String(row.cover_image_snapshot ?? ""),
            currency: String(row.currency_code ?? "NGN"),
            metadata: {
                productType:
                    String(row.product_type_snapshot ?? "physical") === "digital"
                        ? "digital"
                        : "physical",
            },
        };
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    return {
        id: String(cart.id),
        email: cart.email ? String(cart.email) : null,
        status: String(cart.status || "open") as CartDto["status"],
        currency_code: String(cart.currency || "NGN"),
        country: String(cart.country || "NG"),
        region: String(cart.region || ""),
        subtotal,
        total: subtotal,
        items,
    };
}
