type AnyProcess = {
    env?: Record<string, string | undefined>;
    exit?: (code?: number) => void;
};
export {};

const processRef = (globalThis as { process?: AnyProcess }).process;
const env = processRef?.env ?? {};

const SYNC_API_URL =
    String(env.SYNC_API_URL || "http://127.0.0.1:4321/api/admin/sync-products").trim();
const ADMIN_SYNC_TOKEN = String(env.ADMIN_SYNC_TOKEN || "").trim();

async function run(): Promise<void> {
    if (!ADMIN_SYNC_TOKEN) {
        throw new Error("Missing ADMIN_SYNC_TOKEN");
    }

    const response = await fetch(SYNC_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-ADMIN-TOKEN": ADMIN_SYNC_TOKEN,
        },
        body: "{}",
    });

    const text = await response.text();
    const parsed = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(
            `[syncProductsLocal] HTTP ${response.status}: ${JSON.stringify(parsed)}`,
        );
    }

    console.log("[syncProductsLocal] Success:", parsed);
}

run().catch((error) => {
    console.error("[syncProductsLocal] Failed:", error);
    processRef?.exit?.(1);
});
