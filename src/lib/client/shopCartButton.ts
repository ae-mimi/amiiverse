import { cartStore, type ClientCart } from "../cart/cartStore";

function getCartItemCount(cart: ClientCart | null): number {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((sum, item) => sum + Math.max(0, Number(item.quantity || 0)), 0);
}

function updateButtonState(button: HTMLElement, cart: ClientCart | null): void {
    const countEl = button.querySelector("[data-shop-cart-count]") as HTMLElement | null;
    if (!countEl) return;

    const count = getCartItemCount(cart);
    countEl.textContent = String(count);
    countEl.hidden = count <= 0;
}

function openCart(): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("open-checkout", { detail: {} }));
}

let shopCartButtonBound = false;

export function initShopCartButton(): void {
    if (typeof document === "undefined" || shopCartButtonBound) return;
    const button = document.querySelector("[data-shop-cart-button]") as HTMLElement | null;
    if (!button) return;

    shopCartButtonBound = true;
    button.addEventListener("click", openCart);

    void cartStore.initCart().then((cart) => updateButtonState(button, cart));

    window.addEventListener("cart:updated", (event: Event) => {
        const customEvent = event as CustomEvent<ClientCart | null>;
        updateButtonState(button, customEvent.detail ?? null);
    });
}
