/**
 * Order money across the pricing change.
 *
 * Orders written before server pricing stored money in major units (dollars).
 * Orders written after store integer cents. `pricingVersion` tells them apart
 * so the shop and the admin can render both; new Orders always use `CENTS`.
 *
 * This is an edge conversion, like `toCents(product.price)` at the catalogue
 * boundary. Remove it once the stored Orders are backfilled.
 */
import { toCents } from "./money.js";

/** @type {{ CENTS: number }} */
export const ORDER_PRICING = Object.freeze({
  CENTS: 1,
});

/**
 * An Order's amount in integer cents, whichever version wrote it.
 *
 * @param {{ amount?: number, pricingVersion?: number } | null | undefined} order
 * @returns {number}
 */
export function orderAmountCents(order) {
  if (!order || typeof order.amount !== "number") return 0;

  return order.pricingVersion === ORDER_PRICING.CENTS
    ? order.amount
    : toCents(order.amount);
}

/**
 * One Order item's unit price in integer cents, whichever version wrote it.
 *
 * @param {{ price?: number } | null | undefined} item
 * @param {{ pricingVersion?: number } | null | undefined} order
 * @returns {number}
 */
export function orderItemPriceCents(item, order) {
  if (!item || typeof item.price !== "number") return 0;

  return order?.pricingVersion === ORDER_PRICING.CENTS
    ? item.price
    : toCents(item.price);
}
