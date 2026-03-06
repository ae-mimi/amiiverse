import type { D1DatabaseLike } from "./cart";

export async function releaseOrderReservations(
    db: D1DatabaseLike,
    orderId: string,
    nowIso: string,
): Promise<number> {
    const items = await db
        .prepare(
            `SELECT variant_id, quantity
             FROM order_items
             WHERE order_id = ?`,
        )
        .bind(orderId)
        .all();

    let released = 0;
    for (const item of items.results ?? []) {
        const variantId = String(item.variant_id ?? "").trim();
        const qty = Math.max(0, Number(item.quantity ?? 0));
        if (!variantId || qty <= 0) continue;

        await db
            .prepare(
                `UPDATE inventory
                 SET reserved = CASE WHEN reserved >= ? THEN reserved - ? ELSE 0 END,
                     updated_at = ?
                 WHERE variant_id = ?`,
            )
            .bind(qty, qty, nowIso, variantId)
            .run();
        released += qty;
    }

    return released;
}
