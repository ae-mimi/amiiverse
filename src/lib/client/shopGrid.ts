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

function getTypeBadge(type: string): string {
    return type === "digital" ? "Digital Asset" : "Physical Product";
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
        <div class="col-12 col-md-6 col-lg-4 mb-4" data-grid-item data-type="${productType}" data-price="${price}">
            <div class="card card-product card-plain" data-title="${title}" data-price="${price}">
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
                    <p class="text-sm mb-1 text-secondary">${getTypeBadge(productType)}</p>
                    <a href="/shop/${slug}" style="text-decoration: none;">
                        <h5 class="font-weight-bold">${title}</h5>
                    </a>
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <p class="mb-0 text-sm font-weight-bold">${formatPrice(price)}</p>
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
                            Quick Buy
                        </button>
                        <a href="/shop/${slug}" class="btn btn-outline-dark">View</a>
                    </div>
                </div>
            </div>
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
    const grid = root.querySelector("[data-grid]") as HTMLElement | null;
    const emptyState = root.querySelector("[data-empty]") as HTMLElement | null;
    if (!grid || !emptyState) return;

    let currentFilter = "all";
    let searchQuery = "";
    let currentSort = "newest";
    let searchDebounceTimer: number | null = null;

    const setEmptyState = (hasItems: boolean) => {
        emptyState.hidden = hasItems;
        emptyState.style.display = hasItems ? "none" : "block";
    };

    const renderProducts = (items: ShopProduct[]) => {
        if (!items.length) {
            grid.innerHTML = "";
            setEmptyState(false);
            return;
        }

        grid.innerHTML = items.map(renderCard).join("");
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
}

export function initShopGrid(): void {
    if (typeof document === "undefined") return;
    const roots = document.querySelectorAll("[data-shop-grid-root]");
    roots.forEach((root) => bindShopGrid(root as HTMLElement));
}
