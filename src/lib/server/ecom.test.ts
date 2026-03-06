import { describe, expect, it } from "vitest";
import {
    canTransitionOrderStatus,
    getFxRate,
    normalizeCountry,
    normalizeCurrency,
    pickShippingMinor,
    pickTaxRateBps,
} from "./ecom";

function makeDb(firstResponder: (sql: string, params: unknown[]) => Record<string, unknown> | null) {
    return {
        prepare(sql: string) {
            const state: { params: unknown[] } = { params: [] };
            return {
                bind(...values: unknown[]) {
                    state.params = values;
                    return this;
                },
                async first() {
                    return firstResponder(sql, state.params);
                },
            };
        },
    } as any;
}

describe("ecom helpers", () => {
    it("normalizes currency and country safely", () => {
        expect(normalizeCurrency("usd")).toBe("USD");
        expect(normalizeCurrency("bad")).toBe("NGN");
        expect(normalizeCountry("ng")).toBe("NG");
        expect(normalizeCountry("")).toBe("NG");
    });

    it("loads fx rate from DB and falls back", async () => {
        const db = makeDb((sql) => {
            if (sql.includes("FROM fx_rates")) return { rate: 0.001 };
            return null;
        });
        await expect(getFxRate(db, "USD")).resolves.toBe(0.001);

        const dbMissing = makeDb(() => null);
        await expect(getFxRate(dbMissing, "GBP")).resolves.toBe(0.00052);
    });

    it("picks shipping and tax rules", async () => {
        const db = makeDb((sql) => {
            if (sql.includes("FROM shipping_rules")) return { price_minor: 2500 };
            if (sql.includes("FROM tax_rules")) return { rate_bps: 750 };
            return null;
        });
        await expect(
            pickShippingMinor(db, {
                country: "NG",
                region: "",
                currency: "NGN",
                subtotalMinor: 10000,
                weightGrams: 500,
            }),
        ).resolves.toBe(2500);
        await expect(
            pickTaxRateBps(db, {
                country: "NG",
                region: "",
                productType: "physical",
            }),
        ).resolves.toBe(750);
    });

    it("enforces order status transitions", () => {
        expect(canTransitionOrderStatus("pending_payment", "paid")).toBe(true);
        expect(canTransitionOrderStatus("paid", "fulfilled")).toBe(false);
        expect(canTransitionOrderStatus("fulfillment_pending", "fulfilled")).toBe(true);
        expect(canTransitionOrderStatus("refunded", "paid")).toBe(false);
    });
});
