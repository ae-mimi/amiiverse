interface ShopProduct {
    id: string;
    product_id?: string;
    variant_id?: string;
    slug: string;
    title: string;
    price_ngn: number;
    product_type: "physical" | "digital";
    cover_image_url: string;
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
}

function renderCard(item: ShopProduct): string {
    const title = escapeHtml(String(item.title || "Untitled Product"));
    const slug = encodeURIComponent(String(item.slug || ""));
    const image = escapeHtml(String(item.cover_image_url || ""));
    const productType =
        item.product_type === "digital" ? "digital" : "physical";
    const price = Number(item.price_ngn || 0);
    const productId = escapeHtml(String(item.product_id || item.id || ""));
    const variantId = escapeHtml(String(item.variant_id || item.id || ""));

    return `
        <div class="col-12 col-md-6 col-lg-4 mb-4 shopCatalogCell" data-grid-item data-type="${productType}" data-price="${price}">
            <article class="card card-product card-plain" data-title="${title}" data-price="${price}">
                <div class="shopCardBadgeRow">
                    <span class="shopProductTag ${productType === "digital" ? "isDigital" : "isPhysical"}">${productType === "digital" ? "Digital" : "Physical"}</span>
                    <span class="shopProductTag isAccent">${productType === "digital" ? "Instant access" : "Ready to ship"}</span>
                </div>
                <div class="card-header">
                    <a href="/shop/${slug}" class="d-block">
                        ${
                            image
                                ? `<img src="${image}" alt="${title}" class="img-fluid border-radius-lg" loading="lazy" />`
                                : `<div class="shopCardImagePlaceholder" style="background: #eee; aspect-ratio: 1/1; border-radius: 12px;"></div>`
                        }
                    </a>
                </div>
                <div class="card-body pb-0">
                    <p class="shopCardMeta">${productType === "digital" ? "Instant delivery" : "Ships from the official shop"}</p>
                    <a href="/shop/${slug}" style="text-decoration: none;">
                        <h5 class="font-weight-bold shopCardTitle">${title}</h5>
                    </a>
                    <div class="shopCardPriceRow">
                        <p class="mb-0 text-sm font-weight-bold shopCardPrice">${formatPrice(price)}</p>
                        <span class="shopCardAssistText">${productType === "digital" ? "Download after payment" : "Checkout for delivery estimate"}</span>
                    </div>
                    <div class="shopCardActions d-flex gap-2 mb-3">
                        <button
                            class="btn btn-dark w-100"
                            data-quickbuy
                            data-product-id="${productId}"
                            data-variant-id="${variantId}"
                            data-quantity="1"
                            data-title="${title}"
                            data-price="${price}"
                            data-image="${image}"
                            data-type="${productType}"
                        >
                            Add to Cart
                        </button>
                        <a href="/shop/${slug}" class="btn btn-outline-dark">Details</a>
                    </div>
                </div>
            </article>
        </div>
    `;
}

function bindShopGrid(root: HTMLElement): void {
    if (root.dataset.bound === "true") return;
    root.dataset.bound = "true";

    const searchInput = root.querySelector(
        "[data-shop-search]",
    ) as HTMLInputElement | null;
    const sortSelect = root.querySelector(
        "[data-shop-sort]",
    ) as HTMLSelectElement | null;
    const chips = root.querySelectorAll("[data-shop-filter]");
    const viewButtons = root.querySelectorAll("[data-shop-view]");
    const grid = root.querySelector("[data-grid]") as HTMLElement | null;
    const emptyState = root.querySelector("[data-empty]") as HTMLElement | null;
    const countLabel = root.querySelector("[data-shop-count-label]") as HTMLElement | null;
    if (!grid || !emptyState) return;

    let currentFilter = "all";
    let searchQuery = "";
    let currentSort = "newest";
    let currentView: "grid" | "list" = "grid";
    let searchDebounceTimer: number | null = null;

    const setEmptyState = (hasItems: boolean) => {
        emptyState.hidden = hasItems;
        emptyState.style.display = hasItems ? "none" : "block";
    };

    const renderProducts = (items: ShopProduct[]) => {
        if (!items.length) {
            grid.innerHTML = "";
            setEmptyState(false);
            if (countLabel) countLabel.textContent = "0 items";
            return;
        }

        grid.innerHTML = items.map(renderCard).join("");
        grid.setAttribute("data-view", currentView);
        if (countLabel) {
            countLabel.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;
        }
        setEmptyState(true);
    };

    const loadProducts = async () => {
        try {
            const params = new URLSearchParams();
            if (currentFilter === "physical" || currentFilter === "digital") {
                params.set("type", currentFilter);
            }
            if (searchQuery.trim()) {
                params.set("query", searchQuery.trim());
            }
            params.set("sort", currentSort);

            const response = await fetch(`/api/shop/products?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = (await response.json()) as { products?: ShopProduct[] };
            renderProducts(Array.isArray(data.products) ? data.products : []);
        } catch (error) {
            console.error("[shop-grid] failed to load products", error);
            renderProducts([]);
        }
    };

    searchInput?.addEventListener("input", (event) => {
        searchQuery = (event.target as HTMLInputElement).value;
        if (searchDebounceTimer) {
            window.clearTimeout(searchDebounceTimer);
        }
        searchDebounceTimer = window.setTimeout(loadProducts, 300);
    });

    sortSelect?.addEventListener("change", (event) => {
        currentSort = (event.target as HTMLSelectElement).value || "newest";
        loadProducts();
    });

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            chips.forEach((item) => item.classList.remove("isActive"));
            chip.classList.add("isActive");
            currentFilter = (chip as HTMLElement).dataset.shopFilter || "all";
            loadProducts();
        });
    });

    viewButtons.forEach((button) => {
        button.addEventListener("click", () => {
            viewButtons.forEach((item) => item.classList.remove("isActive"));
            button.classList.add("isActive");
            currentView =
                ((button as HTMLElement).dataset.shopView as "grid" | "list") || "grid";
            grid.setAttribute("data-view", currentView);
        });
    });

    grid.setAttribute("data-view", currentView);
}

export function initShopGrid(): void {
    if (typeof document === "undefined") return;
    const roots = document.querySelectorAll("[data-shop-grid-root]");
    roots.forEach((root) => bindShopGrid(root as HTMLElement));
}
