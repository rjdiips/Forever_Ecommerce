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
 * The statuses an Order moves through, in the order the admin offers them.
 *
 * One definition shared by the admin select, the order model and the status
 * route, so a typo can neither be written nor displayed.
 *
 * @type {Record<string, string>}
 */
export const ORDER_STATUS = Object.freeze({
  PLACED: "Order Placed",
  PACKING: "Packing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
});

/** The order statuses in display order. @type {string[]} */
export const ORDER_STATUSES = Object.freeze(Object.values(ORDER_STATUS));

/**
 * Whether `value` is one of the known order statuses.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isOrderStatus(value) {
  return ORDER_STATUSES.includes(value);
}

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
