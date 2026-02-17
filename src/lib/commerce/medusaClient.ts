export interface MedusaProductVariant {
    id: string;
    title?: string | null;
    sku?: string | null;
    [key: string]: unknown;
}

export interface MedusaProduct {
    id: string;
    title: string;
    handle: string;
    description?: string | null;
    thumbnail?: string | null;
    variants?: MedusaProductVariant[];
    [key: string]: unknown;
}

export interface MedusaCartLineItem {
    id: string;
    variant_id?: string;
    quantity: number;
    [key: string]: unknown;
}

export interface MedusaCart {
    id: string;
    items?: MedusaCartLineItem[];
    currency_code?: string;
    total?: number;
    [key: string]: unknown;
}

const MEDUSA_BACKEND_URL = import.meta.env.PUBLIC_MEDUSA_BACKEND_URL?.replace(/\/+$/, "") ?? "";

function resolveBackendUrl(): string | null {
    if (!MEDUSA_BACKEND_URL) {
        console.warn("[medusa] Missing PUBLIC_MEDUSA_BACKEND_URL");
        return null;
    }

    return MEDUSA_BACKEND_URL;
}

async function safeRequest<T>(path: string, init: RequestInit, fallback: T): Promise<T> {
    try {
        const baseUrl = resolveBackendUrl();
        if (!baseUrl) return fallback;

        const response = await fetch(`${baseUrl}${path}`, {
            ...init,
            headers: {
                Accept: "application/json",
                ...(init.body ? { "Content-Type": "application/json" } : {}),
                ...(init.headers ?? {}),
            },
        });

        if (!response.ok) {
            console.error(`[medusa] ${init.method ?? "GET"} ${path} failed with status ${response.status}`);
            return fallback;
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error(`[medusa] ${init.method ?? "GET"} ${path} request error`, error);
        return fallback;
    }
}

export async function getProducts(): Promise<MedusaProduct[]> {
    const response = await safeRequest<{ products?: MedusaProduct[] }>(
        "/store/products",
        { method: "GET" },
        { products: [] },
    );

    return response.products ?? [];
}

export async function getProductByHandle(handle: string): Promise<MedusaProduct | null> {
    if (!handle) return null;

    const response = await safeRequest<{ products?: MedusaProduct[] }>(
        `/store/products?handle=${encodeURIComponent(handle)}`,
        { method: "GET" },
        { products: [] },
    );

    return response.products?.[0] ?? null;
}

export async function createCart(): Promise<MedusaCart | null> {
    const response = await safeRequest<{ cart?: MedusaCart } | null>(
        "/store/carts",
        {
            method: "POST",
            body: JSON.stringify({}),
        },
        null,
    );

    return response?.cart ?? null;
}

export async function addLineItem(
    cartId: string,
    variantId: string,
    quantity: number,
): Promise<MedusaCart | null> {
    if (!cartId || !variantId || quantity <= 0) return null;

    const response = await safeRequest<{ cart?: MedusaCart } | null>(
        `/store/carts/${encodeURIComponent(cartId)}/line-items`,
        {
            method: "POST",
            body: JSON.stringify({
                variant_id: variantId,
                quantity,
            }),
        },
        null,
    );

    return response?.cart ?? null;
}

export async function retrieveCart(cartId: string): Promise<MedusaCart | null> {
    if (!cartId) return null;

    const response = await safeRequest<{ cart?: MedusaCart } | null>(
        `/store/carts/${encodeURIComponent(cartId)}`,
        { method: "GET" },
        null,
    );

    return response?.cart ?? null;
}