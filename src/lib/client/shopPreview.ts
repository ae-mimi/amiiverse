interface PreviewPayload {
    slug: string;
    title?: string;
    image?: string;
    type?: string;
    price?: number;
    productId?: string;
    variantId?: string;
}

interface ProductVariant {
    id: string;
    title?: string;
    price_ngn: number;
    stock?: { available: number; is_in_stock: boolean };
}

interface ProductResponse {
    product?: {
        id: string;
        slug: string;
        title: string;
        description: string;
        short_description?: string;
        product_type: "physical" | "digital";
        cover_image_url: string;
        gallery_images?: string[];
    };
    variants?: ProductVariant[];
}

let previewBound = false;

function formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
}

function setOverlayState(overlay: HTMLElement, isOpen: boolean): void {
    overlay.hidden = !isOpen;
    overlay.classList.toggle("isOpen", isOpen);
    overlay.setAttribute("aria-hidden", isOpen ? "false" : "true");
    document.body.classList.toggle("shopPreviewOpen", isOpen);
}

export function initShopPreview(): void {
    if (typeof document === "undefined" || previewBound) return;
    previewBound = true;

    const overlay = document.getElementById("shop-preview-modal") as HTMLElement | null;
    if (!overlay) return;

    const imageEl = document.getElementById("shop-preview-image") as HTMLImageElement | null;
    const titleEl = document.getElementById("shop-preview-title") as HTMLElement | null;
    const typeEl = document.getElementById("shop-preview-type") as HTMLElement | null;
    const priceEl = document.getElementById("shop-preview-price") as HTMLElement | null;
    const descriptionEl = document.getElementById("shop-preview-description") as HTMLElement | null;
    const linkEl = document.getElementById("shop-preview-link") as HTMLAnchorElement | null;
    const addButton = document.getElementById("shop-preview-add") as HTMLButtonElement | null;

    const close = () => setOverlayState(overlay, false);

    const fillPreview = async (payload: PreviewPayload) => {
        const detailUrl = `/shop/${payload.slug}`;
        const fallbackTitle = payload.title || "Product preview";
        const fallbackImage = payload.image || "";
        const fallbackType = payload.type === "digital" ? "Digital release" : "Physical merch";
        const fallbackPrice = Number(payload.price || 0);

        if (titleEl) titleEl.textContent = fallbackTitle;
        if (typeEl) typeEl.textContent = fallbackType;
        if (priceEl) priceEl.textContent = formatPrice(fallbackPrice);
        if (descriptionEl) descriptionEl.textContent = "";
        if (linkEl) linkEl.href = detailUrl;
        if (imageEl) {
            imageEl.src = fallbackImage;
            imageEl.alt = fallbackTitle;
        }
        if (addButton) {
            addButton.dataset.productId = payload.productId || "";
            addButton.dataset.variantId = payload.variantId || "";
            addButton.dataset.quantity = "1";
            addButton.dataset.title = fallbackTitle;
            addButton.dataset.price = String(fallbackPrice);
            addButton.dataset.image = fallbackImage;
            addButton.dataset.type = payload.type === "digital" ? "digital" : "physical";
        }

        try {
            const response = await fetch(`/api/shop/product?slug=${encodeURIComponent(payload.slug)}`);
            if (!response.ok) return;

            const data = (await response.json()) as ProductResponse;
            const product = data.product;
            const firstVariant = data.variants?.find((variant) => variant?.id) || data.variants?.[0];
            if (!product) return;

            const liveTitle = product.title || fallbackTitle;
            const liveImage = product.gallery_images?.[0] || product.cover_image_url || fallbackImage;
            const liveType = product.product_type === "digital" ? "Digital release" : "Physical merch";
            const livePrice = Number(firstVariant?.price_ngn || fallbackPrice);
            const liveDescription = String(
                product.short_description || product.description || "",
            ).trim();

            if (titleEl) titleEl.textContent = liveTitle;
            if (typeEl) typeEl.textContent = liveType;
            if (priceEl) priceEl.textContent = formatPrice(livePrice);
            if (descriptionEl) {
                descriptionEl.textContent =
                    liveDescription || "Open the full product page to choose options and review details.";
            }
            if (linkEl) linkEl.href = detailUrl;
            if (imageEl) {
                imageEl.src = liveImage;
                imageEl.alt = liveTitle;
            }
            if (addButton) {
                addButton.dataset.productId = product.id || payload.productId || "";
                addButton.dataset.variantId = firstVariant?.id || payload.variantId || "";
                addButton.dataset.title = liveTitle;
                addButton.dataset.price = String(livePrice);
                addButton.dataset.image = liveImage;
                addButton.dataset.type = product.product_type === "digital" ? "digital" : "physical";
                addButton.disabled = Number(firstVariant?.stock?.available || 0) <= 0;
                addButton.textContent =
                    Number(firstVariant?.stock?.available || 0) <= 0 ? "Sold out" : "Add to cart";
            }
        } catch (error) {
            console.error("[shop-preview] failed to load preview", error);
            if (descriptionEl) {
                descriptionEl.textContent =
                    "Open the full product page to choose options and review details.";
            }
        }
    };

    document.addEventListener("click", async (event) => {
        const target = event.target as HTMLElement | null;
        const previewTrigger = target?.closest("[data-shop-preview]") as HTMLElement | null;
        const closeTrigger = target?.closest("[data-shop-preview-close]") as HTMLElement | null;

        if (closeTrigger) {
            close();
            return;
        }

        if (!previewTrigger) return;

        const payload: PreviewPayload = {
            slug: previewTrigger.dataset.slug || "",
            title: previewTrigger.dataset.title,
            image: previewTrigger.dataset.image,
            type: previewTrigger.dataset.type,
            price: Number(previewTrigger.dataset.price || 0),
            productId: previewTrigger.dataset.productId,
            variantId: previewTrigger.dataset.variantId,
        };

        if (!payload.slug) return;

        setOverlayState(overlay, true);
        await fillPreview(payload);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && overlay.classList.contains("isOpen")) {
            close();
        }
    });
}
