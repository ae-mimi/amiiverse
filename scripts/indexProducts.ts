type AnyObject = Record<string, any>;

const env = (globalThis as any).process?.env ?? {};

const SHOP_PRODUCTS_API_URL = String(
    env.SHOP_PRODUCTS_API_URL || "http://127.0.0.1:4321/api/shop/products",
).replace(/\/+$/, "");
const TYPESENSE_HOST = String(env.TYPESENSE_HOST || "").replace(/\/+$/, "");
const TYPESENSE_ADMIN_API_KEY = String(env.TYPESENSE_ADMIN_API_KEY || "");
const TYPESENSE_COLLECTION = String(env.TYPESENSE_COLLECTION || "products");

interface ShopProduct {
    id: string;
    title?: string;
    slug?: string;
    cover_image_url?: string;
    product_type?: string;
    price_ngn?: number;
}

function assertConfig(): void {
    const missing: string[] = [];
    if (!SHOP_PRODUCTS_API_URL) missing.push("SHOP_PRODUCTS_API_URL");
    if (!TYPESENSE_HOST) missing.push("TYPESENSE_HOST");
    if (!TYPESENSE_ADMIN_API_KEY) missing.push("TYPESENSE_ADMIN_API_KEY");

    if (missing.length) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`,
        );
    }
}

function toPriceKobo(value: unknown): number {
    const ngn = Number(value);
    if (!Number.isFinite(ngn) || ngn <= 0) return 0;
    return Math.round(ngn * 100);
}

async function fetchShopProducts(): Promise<ShopProduct[]> {
    const response = await fetch(SHOP_PRODUCTS_API_URL);
    if (!response.ok) {
        throw new Error(
            `Shop products request failed with status ${response.status}`,
        );
    }

    const data = (await response.json()) as { products?: ShopProduct[] };
    return data.products || [];
}

function toSearchDocument(product: ShopProduct): AnyObject {
    return {
        id: product.id,
        title: product.title || "Untitled Product",
        handle: product.slug || "",
        thumbnail: product.cover_image_url || "",
        price: toPriceKobo(product.price_ngn),
        productType: String(product.product_type || "physical"),
        description: "",
        tags: String(product.product_type || "physical"),
    };
}

async function createCollectionIfMissing(): Promise<void> {
    const schema = {
        name: TYPESENSE_COLLECTION,
        fields: [
            { name: "id", type: "string" },
            { name: "title", type: "string" },
            { name: "handle", type: "string" },
            { name: "thumbnail", type: "string", optional: true },
            { name: "price", type: "float" },
            { name: "productType", type: "string", optional: true },
            { name: "description", type: "string", optional: true },
            { name: "tags", type: "string", optional: true },
        ],
        default_sorting_field: "price",
    };

    const response = await fetch(`${TYPESENSE_HOST}/collections`, {
        method: "POST",
        headers: {
            "X-TYPESENSE-API-KEY": TYPESENSE_ADMIN_API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(schema),
    });

    if (response.status === 409) return;
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
            `Typesense collection creation failed (${response.status}): ${text}`,
        );
    }
}

async function indexDocuments(docs: AnyObject[]): Promise<void> {
    const payload = docs.map((doc) => JSON.stringify(doc)).join("\n");

    const response = await fetch(
        `${TYPESENSE_HOST}/collections/${encodeURIComponent(
            TYPESENSE_COLLECTION,
        )}/documents/import?action=upsert`,
        {
            method: "POST",
            headers: {
                "X-TYPESENSE-API-KEY": TYPESENSE_ADMIN_API_KEY,
                "Content-Type": "text/plain",
            },
            body: payload,
        },
    );

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Typesense import failed (${response.status}): ${text}`);
    }
}

async function run(): Promise<void> {
    assertConfig();
    console.log("[indexProducts] Fetching products from shop API...");
    const shopProducts = await fetchShopProducts();
    const docs = shopProducts
        .map(toSearchDocument)
        .filter((doc) => doc.handle && doc.title);

    await createCollectionIfMissing();
    await indexDocuments(docs);

    console.log(
        `[indexProducts] Indexed ${docs.length} products into "${TYPESENSE_COLLECTION}".`,
    );
}

run().catch((error) => {
    console.error("[indexProducts] Failed:", error);
    (globalThis as any).process?.exit?.(1);
});
