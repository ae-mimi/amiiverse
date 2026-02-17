const TYPESENSE_HOST =
    import.meta.env.PUBLIC_TYPESENSE_HOST?.replace(/\/+$/, "") ?? "";
const TYPESENSE_SEARCH_KEY =
    import.meta.env.PUBLIC_TYPESENSE_SEARCH_API_KEY ??
    import.meta.env.PUBLIC_TYPESENSE_SEARCH_KEY ??
    "";

class TypesenseClient {
    private readonly host: string;
    private readonly apiKey: string;

    constructor(host: string, apiKey: string) {
        this.host = host;
        this.apiKey = apiKey;
    }

    get isConfigured(): boolean {
        return Boolean(this.host && this.apiKey);
    }

    async search(
        collection: string,
        params: Record<string, string>,
    ): Promise<unknown> {
        if (!this.isConfigured) {
            console.warn("[typesense] client is not configured");
            return null;
        }

        const query = new URLSearchParams(params).toString();
        const endpoint = `${this.host}/collections/${encodeURIComponent(collection)}/documents/search?${query}`;

        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "X-TYPESENSE-API-KEY": this.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(
                `[typesense] search failed: ${response.status} ${response.statusText}`,
            );
        }

        return await response.json();
    }
}

export const typesenseClient = new TypesenseClient(
    TYPESENSE_HOST,
    TYPESENSE_SEARCH_KEY,
);

export default typesenseClient;
