import { CURRENCY, formatMoney, toCents } from "./money.js";

/**
 * Product kinds. Most products are `standard`; exactly one product is the
 * `custom-tee` base the tee generator designs onto. Kept here so the shop, the
 * admin and the API classify products the same way.
 */

/** @typedef {"standard" | "custom-tee"} ProductKind */
/** @typedef {{ kind?: ProductKind, [key: string]: unknown }} Product */

/** @type {{ STANDARD: ProductKind, CUSTOM_TEE: ProductKind }} */
export const PRODUCT_KIND = Object.freeze({
  STANDARD: "standard",
  CUSTOM_TEE: "custom-tee",
});

/**
 * Is this product the base the tee generator designs onto?
 *
 * A product with no kind is an ordinary product, so older documents stay in
 * the catalogue.
 *
 * @param {Product | null | undefined} product
 * @returns {boolean}
 */
export function isCustomTee(product) {
  return product?.kind === PRODUCT_KIND.CUSTOM_TEE;
}

/**
 * Coerce an untrusted kind to one of the two we store. Anything that is not
 * the custom-tee base is an ordinary product.
 *
 * @param {unknown} kind
 * @returns {ProductKind}
 */
export function normalizeProductKind(kind) {
  return kind === PRODUCT_KIND.CUSTOM_TEE
    ? PRODUCT_KIND.CUSTOM_TEE
    : PRODUCT_KIND.STANDARD;
}

/**
 * A Product's price for display.
 *
 * Catalogue prices are stored in major units; the shop renders every one the
 * same way by converting at this edge and formatting with the shared currency.
 *
 * @param {number} price the catalogue price, in major units
 * @param {string} [currency] ISO 4217 code, defaults to {@link CURRENCY}.
 * @returns {string}
 */
export function formatProductPrice(price, currency = CURRENCY) {
  return formatMoney(toCents(price), currency);
}

/**
 * The products the storefront catalogue shows: everything except the base.
 *
 * @param {Product[]} [products]
 * @returns {Product[]}
 */
export function catalogueProducts(products = []) {
  return products.filter((product) => !isCustomTee(product));
}

/**
 * The custom-tee base, or null when the catalogue holds none.
 *
 * @param {Product[]} [products]
 * @returns {Product | null}
 */
export function findCustomTee(products = []) {
  return products.find((product) => isCustomTee(product)) ?? null;
}
