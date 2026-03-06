import { createHash } from "node:crypto";
import type { D1DatabaseLike } from "./cart";

export const ALLOWED_CURRENCIES = ["NGN", "USD", "GBP"] as const;
export type CurrencyCode = (typeof ALLOWED_CURRENCIES)[number];

export interface Money {
    amount_minor: number;
    currency: CurrencyCode;
}

export interface QuoteInput {
    cartId: string;
    currency: CurrencyCode;
    country: string;
    region?: string;
}

export interface QuoteResult {
    subtotal: Money;
    shipping: Money;
    tax: Money;
    total: Money;
    fx_rate: number;
    expires_at: string;
    quote_hash: string;
    weight_grams: number;
}

interface CartLineRow {
    item_id: string;
    quantity: number;
    variant_id: string;
    product_id: string;
    product_type: "physical" | "digital";
    base_price_minor_ngn: number;
    title: string;
    sku: string;
    image: string;
    weight_grams: number;
}

interface FxRateRow {
    rate: number;
}

interface ShippingRuleRow {
    price_minor: number;
}

interface TaxRuleRow {
    rate_bps: number;
}

export function normalizeCurrency(value: string | null | undefined): CurrencyCode {
    const upper = String(value ?? "NGN")
        .trim()
        .toUpperCase();
    return (ALLOWED_CURRENCIES as readonly string[]).includes(upper)
        ? (upper as CurrencyCode)
        : "NGN";
}

export function normalizeCountry(value: string | null | undefined): string {
    const normalized = String(value ?? "NG").trim().toUpperCase();
    if (!normalized) return "NG";
    return normalized.slice(0, 2);
}

export function normalizeRegion(value: string | null | undefined): string {
    return String(value ?? "")
        .trim()
        .slice(0, 80);
}

export async function getFxRate(
    db: D1DatabaseLike,
    currency: CurrencyCode,
): Promise<number> {
    if (currency === "NGN") return 1;
    const row = (await db
        .prepare(
            `SELECT rate
             FROM fx_rates
             WHERE base_currency = 'NGN' AND quote_currency = ?
             ORDER BY datetime(as_of) DESC
             LIMIT 1`,
        )
        .bind(currency)
        .first()) as FxRateRow | null;

    if (!row || !Number.isFinite(Number(row.rate)) || Number(row.rate) <= 0) {
        return currency === "USD" ? 0.00065 : 0.00052;
    }
    return Number(row.rate);
}

export async function getCartLines(
    db: D1DatabaseLike,
    cartId: string,
): Promise<CartLineRow[]> {
    const result = await db
        .prepare(
            `SELECT
                ci.id AS item_id,
                ci.quantity,
                COALESCE(ci.variant_id, ci.product_id || '_default') AS variant_id,
                pv.product_id,
                p.product_type,
                pv.base_price_minor_ngn,
                COALESCE(ci.title_snapshot, pv.title, p.title, 'Product') AS title,
                COALESCE(ci.sku_snapshot, pv.sku, '') AS sku,
                COALESCE(ci.cover_image_snapshot, p.cover_image_url, '') AS image,
                COALESCE(pv.weight_grams, 0) AS weight_grams
             FROM cart_items ci
             LEFT JOIN product_variants pv ON pv.id = COALESCE(ci.variant_id, ci.product_id || '_default')
             LEFT JOIN products p ON p.id = pv.product_id
             WHERE ci.cart_id = ?
             ORDER BY ci.rowid DESC`,
        )
        .bind(cartId)
        .all();

    return (result.results ?? []).map((row) => ({
        item_id: String(row.item_id ?? ""),
        quantity: Math.max(1, Number(row.quantity ?? 1)),
        variant_id: String(row.variant_id ?? ""),
        product_id: String(row.product_id ?? ""),
        product_type:
            String(row.product_type ?? "physical") === "digital"
                ? "digital"
                : "physical",
        base_price_minor_ngn: Math.max(0, Number(row.base_price_minor_ngn ?? 0)),
        title: String(row.title ?? "Product"),
        sku: String(row.sku ?? ""),
        image: String(row.image ?? ""),
        weight_grams: Math.max(0, Number(row.weight_grams ?? 0)),
    }));
}

export async function getVariantAvailability(
    db: D1DatabaseLike,
    variantId: string,
): Promise<number> {
    const row = (await db
        .prepare(
            `SELECT
                COALESCE(on_hand, 0) AS on_hand,
                COALESCE(reserved, 0) AS reserved,
                COALESCE(safety_stock, 0) AS safety_stock
             FROM inventory
             WHERE variant_id = ?
             LIMIT 1`,
        )
        .bind(variantId)
        .first()) as { on_hand: number; reserved: number; safety_stock: number } | null;

    if (!row) return 0;
    return Math.max(
        0,
        Number(row.on_hand || 0) -
            Number(row.reserved || 0) -
            Number(row.safety_stock || 0),
    );
}

export async function pickShippingMinor(
    db: D1DatabaseLike,
    args: {
        country: string;
        region: string;
        currency: CurrencyCode;
        subtotalMinor: number;
        weightGrams: number;
    },
): Promise<number> {
    const row = (await db
        .prepare(
            `SELECT price_minor
             FROM shipping_rules
             WHERE country = ?
               AND currency = ?
               AND (region IS NULL OR region = '' OR region = ?)
               AND min_subtotal_minor <= ?
               AND (max_weight_grams IS NULL OR max_weight_grams >= ?)
               AND (active_from IS NULL OR datetime(active_from) <= datetime('now'))
               AND (active_to IS NULL OR datetime(active_to) >= datetime('now'))
             ORDER BY
               CASE WHEN region = ? THEN 0 ELSE 1 END,
               min_subtotal_minor DESC
             LIMIT 1`,
        )
        .bind(
            args.country,
            args.currency,
            args.region || "",
            Math.max(0, args.subtotalMinor),
            Math.max(0, args.weightGrams),
            args.region || "",
        )
        .first()) as ShippingRuleRow | null;

    return Math.max(0, Number(row?.price_minor ?? 0));
}

export async function pickTaxRateBps(
    db: D1DatabaseLike,
    args: {
        country: string;
        region: string;
        productType: "physical" | "digital";
    },
): Promise<number> {
    const row = (await db
        .prepare(
            `SELECT rate_bps
             FROM tax_rules
             WHERE country = ?
               AND (region IS NULL OR region = '' OR region = ?)
               AND (product_type = 'all' OR product_type = ?)
               AND (active_from IS NULL OR datetime(active_from) <= datetime('now'))
               AND (active_to IS NULL OR datetime(active_to) >= datetime('now'))
             ORDER BY
               CASE WHEN product_type = ? THEN 0 ELSE 1 END,
               CASE WHEN region = ? THEN 0 ELSE 1 END,
               rate_bps DESC
             LIMIT 1`,
        )
        .bind(
            args.country,
            args.region || "",
            args.productType,
            args.productType,
            args.region || "",
        )
        .first()) as TaxRuleRow | null;

    return Math.max(0, Number(row?.rate_bps ?? 0));
}

export function toMoney(amountMinor: number, currency: CurrencyCode): Money {
    return {
        amount_minor: Math.max(0, Math.round(amountMinor)),
        currency,
    };
}

export function buildQuoteHash(input: {
    cartId: string;
    currency: CurrencyCode;
    country: string;
    region: string;
    subtotalMinor: number;
    shippingMinor: number;
    taxMinor: number;
    totalMinor: number;
    fxRate: number;
    lineFingerprints: string[];
}): string {
    const payload = JSON.stringify({
        cartId: input.cartId,
        currency: input.currency,
        country: input.country,
        region: input.region,
        subtotalMinor: input.subtotalMinor,
        shippingMinor: input.shippingMinor,
        taxMinor: input.taxMinor,
        totalMinor: input.totalMinor,
        fxRate: Number(input.fxRate.toFixed(8)),
        lines: input.lineFingerprints,
    });
    return createHash("sha256").update(payload).digest("hex");
}

export async function buildQuote(
    db: D1DatabaseLike,
    input: QuoteInput,
): Promise<QuoteResult> {
    const lines = await getCartLines(db, input.cartId);
    let subtotalNgn = 0;
    let totalWeight = 0;
    const lineFingerprints: string[] = [];
    let dominantProductType: "physical" | "digital" = "physical";

    for (const line of lines) {
        const lineTotalNgn = line.base_price_minor_ngn * line.quantity;
        subtotalNgn += lineTotalNgn;
        totalWeight += line.weight_grams * line.quantity;
        if (line.product_type === "digital") dominantProductType = "digital";
        lineFingerprints.push(
            `${line.variant_id}:${line.quantity}:${line.base_price_minor_ngn}`,
        );
    }

    const fxRate = await getFxRate(db, input.currency);
    const subtotalMinor = Math.round(subtotalNgn * fxRate);
    const shippingMinor = await pickShippingMinor(db, {
        country: input.country,
        region: input.region ?? "",
        currency: input.currency,
        subtotalMinor,
        weightGrams: totalWeight,
    });
    const taxRateBps = await pickTaxRateBps(db, {
        country: input.country,
        region: input.region ?? "",
        productType: dominantProductType,
    });
    const taxMinor = Math.round((subtotalMinor + shippingMinor) * (taxRateBps / 10000));
    const totalMinor = subtotalMinor + shippingMinor + taxMinor;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    return {
        subtotal: toMoney(subtotalMinor, input.currency),
        shipping: toMoney(shippingMinor, input.currency),
        tax: toMoney(taxMinor, input.currency),
        total: toMoney(totalMinor, input.currency),
        fx_rate: fxRate,
        expires_at: expiresAt,
        quote_hash: buildQuoteHash({
            cartId: input.cartId,
            currency: input.currency,
            country: input.country,
            region: input.region ?? "",
            subtotalMinor,
            shippingMinor,
            taxMinor,
            totalMinor,
            fxRate,
            lineFingerprints,
        }),
        weight_grams: totalWeight,
    };
}

export function canTransitionOrderStatus(from: string, to: string): boolean {
    const graph: Record<string, string[]> = {
        pending_payment: ["paid", "cancelled", "failed"],
        paid: ["fulfillment_pending", "refund_pending", "refunded"],
        fulfillment_pending: ["fulfilled", "refund_pending"],
        fulfilled: ["refund_pending", "refunded"],
        refund_pending: ["refunded"],
        refunded: [],
        cancelled: [],
        failed: [],
    };

    return (graph[from] ?? []).includes(to);
}
