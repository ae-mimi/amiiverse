const CART_ID_STORAGE_KEY = "cart_id";

export interface ClientCartItem {
    id: string;
    product_id?: string;
    variant_id?: string;
    sku?: string;
    quantity: number;
    unit_price?: number;
    unit_price_minor?: number;
    currency?: string;
    total?: number;
    title?: string;
    thumbnail?: string;
    metadata?: {
        productType?: string;
        [key: string]: unknown;
    };
}

export interface ClientCart {
    id: string;
    email?: string | null;
    status?: string;
    currency_code?: string;
    subtotal?: number;
    total?: number;
    items?: ClientCartItem[];
}

function isBrowser(): boolean {
    return typeof window !== "undefined";
}

function getStoredCartId(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(CART_ID_STORAGE_KEY);
}

function setStoredCartId(cartId: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
}

function clearStoredCartId(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(CART_ID_STORAGE_KEY);
}

function dispatchCartUpdated(cart: ClientCart | null): void {
    if (!isBrowser()) return;
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: cart }));
}

async function postJson<T = any>(
    url: string,
    body: Record<string, unknown>,
): Promise<T | null> {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!response.ok) return null;
        return (await response.json()) as T;
    } catch (error) {
        console.error(`[cart] POST ${url} failed`, error);
        return null;
    }
}

async function getJson<T = any>(url: string): Promise<T | null> {
    try {
        const response = await fetch(url, { method: "GET" });
        if (!response.ok) return null;
        return (await response.json()) as T;
    } catch (error) {
        console.error(`[cart] GET ${url} failed`, error);
        return null;
    }
}

async function createCart(): Promise<ClientCart | null> {
    const result = await postJson<{ cart?: ClientCart }>("/api/cart/create", {});
    return result?.cart ?? null;
}

async function retrieveCart(cartId: string): Promise<ClientCart | null> {
    if (!cartId) return null;
    const result = await getJson<{ cart?: ClientCart }>(
        `/api/cart/get?cartId=${encodeURIComponent(cartId)}`,
    );
    return result?.cart ?? null;
}

async function addItem(
    cartId: string,
    productId: string,
    quantity: number,
): Promise<ClientCart | null> {
    const result = await postJson<{ cart?: ClientCart }>("/api/cart/add", {
        cartId,
        productId,
        quantity,
    });
    return result?.cart ?? null;
}

async function updateItem(
    cartId: string,
    itemId: string,
    quantity: number,
): Promise<ClientCart | null> {
    const result = await postJson<{ cart?: ClientCart }>("/api/cart/update", {
        cartId,
        itemId,
        quantity,
    });
    return result?.cart ?? null;
}

async function removeItem(
    cartId: string,
    itemId: string,
): Promise<ClientCart | null> {
    const result = await postJson<{ cart?: ClientCart }>("/api/cart/remove", {
        cartId,
        itemId,
    });
    return result?.cart ?? null;
}

let cartCache: ClientCart | null = null;
let initPromise: Promise<ClientCart | null> | null = null;

async function createAndStoreCart(): Promise<ClientCart | null> {
    const createdCart = await createCart();
    if (!createdCart?.id) return null;

    setStoredCartId(createdCart.id);
    cartCache = createdCart;
    dispatchCartUpdated(cartCache);
    return cartCache;
}

export async function initCart(): Promise<ClientCart | null> {
    if (!isBrowser()) return null;

    if (cartCache?.id) return cartCache;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const storedCartId = getStoredCartId();
        if (!storedCartId) {
            cartCache = null;
            dispatchCartUpdated(null);
            return null;
        }

        const existingCart = await retrieveCart(storedCartId);
        if (existingCart?.id) {
            setStoredCartId(existingCart.id);
            cartCache = existingCart;
            dispatchCartUpdated(cartCache);
            return cartCache;
        }

        clearStoredCartId();
        cartCache = null;
        dispatchCartUpdated(null);
        return null;
    })();

    try {
        return await initPromise;
    } finally {
        initPromise = null;
    }
}

export async function getCart(): Promise<ClientCart | null> {
    if (!isBrowser()) return null;
    if (cartCache?.id) return cartCache;

    const storedCartId = getStoredCartId();
    if (!storedCartId) return null;

    const cart = await retrieveCart(storedCartId);
    if (!cart?.id) return null;

    cartCache = cart;
    return cartCache;
}

export async function addToCart(
    productId: string,
    quantity = 1,
): Promise<ClientCart | null> {
    if (!productId || quantity <= 0) return await getCart();

    let cart = await initCart();
    if (!cart?.id) {
        cart = await createAndStoreCart();
    }
    if (!cart?.id) return null;

    const updatedCart = await addItem(cart.id, productId, quantity);
    if (!updatedCart?.id) return await getCart();

    cartCache = updatedCart;
    dispatchCartUpdated(cartCache);
    return cartCache;
}

export async function removeLineItem(itemId: string): Promise<ClientCart | null> {
    if (!itemId) return await getCart();

    const cart = await initCart();
    if (!cart?.id) return null;

    const updatedCart = await removeItem(cart.id, itemId);
    cartCache = updatedCart ?? (await retrieveCart(cart.id));
    dispatchCartUpdated(cartCache);
    return cartCache;
}

export async function updateQuantity(
    itemId: string,
    quantity: number,
): Promise<ClientCart | null> {
    if (!itemId) return await getCart();

    const cart = await initCart();
    if (!cart?.id) return null;

    const updatedCart =
        quantity <= 0
            ? await removeItem(cart.id, itemId)
            : await updateItem(cart.id, itemId, quantity);

    cartCache = updatedCart ?? (await retrieveCart(cart.id));
    dispatchCartUpdated(cartCache);
    return cartCache;
}

export const cartStore = {
    initCart,
    addToCart,
    removeLineItem,
    updateQuantity,
    getCart,
};
