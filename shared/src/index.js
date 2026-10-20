/**
 * `@forever/shared` — the values the shop, the admin and the API must agree on.
 *
 * Plain ESM with JSDoc: consumed straight from source, with no build step.
 */
export {
  GENERIC_PASSWORD_RESET_CONFIRMATION,
  MIN_PASSWORD_LENGTH,
  passwordTooShortMessage,
} from "./auth.js";
export { requireApiBaseUrl } from "./config.js";
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
  ORDER_STATUS,
  ORDER_STATUSES,
  isOrderStatus,
  orderAmountCents,
  orderItemPriceCents,
} from "./order.js";
export {
  PRODUCT_KIND,
  TEE_COLORS,
  catalogueProducts,
  formatProductPrice,
  isCustomTee,
  normalizeProductKind,
  normalizeTeeColor,
  orderProducts,
  teeBases,
  findTeeBase,
  teeColors,
} from "./product.js";
export {
  CATEGORIES,
  SUB_CATEGORIES,
  isCategory,
  isSubCategory,
} from "./taxonomy.js";
