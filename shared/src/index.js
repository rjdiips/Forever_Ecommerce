/**
 * `@forever/shared` — the values the shop, the admin and the API must agree on.
 *
 * Plain ESM with JSDoc: consumed straight from source, with no build step.
 */
export { CURRENCY, formatMoney, fromCents, toCents } from "./money.js";
export { DELIVERY_FEE } from "./delivery.js";
export {
  addCartLine,
  cartLineId,
  cartLines,
  setCartLineQuantity,
} from "./cart.js";
export {
  ORDER_PRICING,
  orderAmountCents,
  orderItemPriceCents,
} from "./order.js";
export {
  PRODUCT_KIND,
  catalogueProducts,
  findCustomTee,
  isCustomTee,
  normalizeProductKind,
} from "./product.js";
export {
  CATEGORIES,
  SUB_CATEGORIES,
  isCategory,
  isSubCategory,
} from "./taxonomy.js";
