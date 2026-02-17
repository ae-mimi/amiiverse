type AnyObject = Record<string, any>;

const env = (globalThis as any).process?.env ?? {};

const MEDUSA_BACKEND_URL =
    String(env.MEDUSA_BACKEND_URL || env.PUBLIC_MEDUSA_BACKEND_URL || "").replace(
        /\/+$/,
        "",
    );
const TYPESENSE_HOST = String(env.TYPESENSE_HOST || "").replace(/\/+$/, "");
const TYPESENSE_ADMIN_API_KEY = String(env.TYPESENSE_ADMIN_API_KEY || "");
const TYPESENSE_COLLECTION = String(env.TYPESENSE_COLLECTION || "products");

interface MedusaProduct {
    id: string;
    title?: string;
    handle?: string;
    thumbnail?: string;
    metadata?: Record<string, unknown>;
    variants?: Array<Record<string, unknown>>;
    price?: number;
}

function assertConfig(): void {
    const missing: string[] = [];
    if (!MEDUSA_BACKEND_URL) missing.push("MEDUSA_BACKEND_URL");
    if (!TYPESENSE_HOST) missing.push("TYPESENSE_HOST");
    if (!TYPESENSE_ADMIN_API_KEY) missing.push("TYPESENSE_ADMIN_API_KEY");

    if (missing.length) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`,
        );
    }
}

function getProductPrice(product: MedusaProduct): number {
    const amountCandidates = [
        product?.variants?.[0]?.calculated_price?.calculated_amount,
        product?.variants?.[0]?.calculated_price?.original_amount,
        product?.variants?.[0]?.prices?.[0]?.amount,
        product?.price,
    ];

    for (const candidate of amountCandidates) {
        const numeric = Number(candidate);
        if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }

    return 0;
}

async function fetchMedusaProducts(): Promise<MedusaProduct[]> {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products`);
    if (!response.ok) {
        throw new Error(`Medusa request failed with status ${response.status}`);
    }

    const data = (await response.json()) as { products?: MedusaProduct[] };
    return data.products || [];
}

function toSearchDocument(product: MedusaProduct): AnyObject {
    return {
        id: product.id,
        title: product.title || "Untitled Product",
        handle: product.handle || "",
        thumbnail: product.thumbnail || "",
        price: getProductPrice(product),
        productType: String(product.metadata?.productType || "physical"),
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
    console.log("[indexProducts] Fetching products from Medusa...");
    const medusaProducts = await fetchMedusaProducts();
    const docs = medusaProducts
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

