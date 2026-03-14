import type { QuickBuyPayload } from "./contracts";

function parseNumber(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function dispatchQuickBuy(payload: QuickBuyPayload): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent("open-checkout", {
            detail: payload,
        }),
    );
}

function payloadFromButton(button: HTMLElement): QuickBuyPayload | null {
    const { productId, variantId, quantity, type, title, price, image } =
        button.dataset;

    if (!productId && !variantId) return null;

    return {
        productId: productId || undefined,
        variantId: variantId || undefined,
        quantity: Math.max(1, parseInt(quantity || "1", 10) || 1),
        productType: type === "digital" ? "digital" : "physical",
        title: title || undefined,
        price: parseNumber(price),
        image: image || undefined,
    };
}

let quickBuyBound = false;

export function initQuickBuyInteractions(): void {
    if (typeof document === "undefined" || quickBuyBound) return;
    quickBuyBound = true;

    document.addEventListener("click", (event) => {
        const target = event.target as HTMLElement | null;
        const button = target?.closest("[data-quickbuy]") as HTMLElement | null;
        if (!button) return;

        const payload = payloadFromButton(button);
        if (!payload) return;

        dispatchQuickBuy(payload);
    });
}
