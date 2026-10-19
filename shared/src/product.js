import { CURRENCY, formatMoney, toCents } from "./money.js";

/**
 * Product kinds. Most products are `standard`; a `custom-tee` product is a
 * Tee base the tee generator designs onto, one per colour. Kept here so the
 * shop, the admin and the API classify products the same way.
 */

/** @typedef {"standard" | "custom-tee"} ProductKind */
/** @typedef {"white" | "black"} TeeColor */
/** @typedef {{ kind?: ProductKind, color?: TeeColor | null, position?: number, date?: number, [key: string]: unknown }} Product */

/** @type {{ STANDARD: ProductKind, CUSTOM_TEE: ProductKind }} */
export const PRODUCT_KIND = Object.freeze({
  STANDARD: "standard",
  CUSTOM_TEE: "custom-tee",
});

/**
 * The colours a Tee base can be, and so the only colours the tee generator can
 * design onto. Closed on purpose: a new colour is a change here, not just an
 * admin action.
 *
 * @type {readonly TeeColor[]}
 */
export const TEE_COLORS = Object.freeze(["white", "black"]);

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
 * Coerce an untrusted colour to the Tee base vocabulary, or to no colour.
 *
 * A base saved before colours existed has none, and a malformed colour is
 * treated the same way: no colour, rather than one the tee generator would not
 * recognise.
 *
 * @param {unknown} color
 * @returns {TeeColor | null}
 */
export function normalizeTeeColor(color) {
  return TEE_COLORS.includes(color) ? color : null;
}

/**
 * A Product's price for display.
 *
 * Catalogue prices are stored in major units; the shop and the admin render
 * every one the same way by converting at this edge and formatting with the
 * shared currency.
 *
 * @param {number} priceMajorUnits the catalogue price, before conversion
 * @param {string} [currency] ISO 4217 code, defaults to {@link CURRENCY}.
 * @returns {string}
 */
export function formatProductPrice(priceMajorUnits, currency = CURRENCY) {
  return formatMoney(toCents(priceMajorUnits), currency);
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

/**
 * The Tee bases in catalogue display order: one Product per colour, each
 * supplying the price, the sizes and the blank image the generator designs
 * onto. A base saved before colours existed is still a base; it simply offers
 * no colour.
 *
 * @param {Product[]} [products]
 * @returns {Product[]}
 */
export function teeBases(products = []) {
  return orderProducts(products.filter(isCustomTee));
}

/**
 * The Tee base for a colour, or null when the catalogue offers none.
 *
 * A malformed colour, a colour with no base, and a base saved before colours
 * existed all resolve to null, so the caller can treat them alike.
 *
 * @param {Product[]} [products]
 * @param {unknown} color
 * @returns {Product | null}
 */
export function findTeeBase(products = [], color) {
  const wanted = normalizeTeeColor(color);
  if (wanted === null) return null;

  return (
    products.find(
      (product) =>
        isCustomTee(product) && normalizeTeeColor(product.color) === wanted
    ) ?? null
  );
}

/**
 * The colours the catalogue actually offers, in vocabulary order.
 *
 * A colour with no base is not offered, so the tee generator can never present
 * a colour it cannot design onto or buy; a base with no colour offers nothing.
 * Two bases of the same colour still offer it once.
 *
 * @param {Product[]} [products]
 * @returns {TeeColor[]}
 */
export function teeColors(products = []) {
  const colors = products
    .filter(isCustomTee)
    .map((product) => normalizeTeeColor(product.color));

  return TEE_COLORS.filter((color) => colors.includes(color));
}

/**
 * A Product's stored display position. Products saved before ordering existed
 * have none, which reads as `0` so they keep their place ahead of newly added
 * Products.
 *
 * @param {Product | null | undefined} product
 * @returns {number}
 */
function positionOf(product) {
  const position = product?.position;
  return Number.isFinite(position) ? position : 0;
}

/**
 * @param {Product | null | undefined} product
 * @returns {number}
 */
function dateOf(product) {
  const date = product?.date;
  return Number.isFinite(date) ? date : 0;
}

/**
 * The Products in their catalogue display order.
 *
 * Ordered by the admin-set `position`, then by the date each Product was added,
 * then by id so the order is total and stable. A newly added Product is given a
 * later position than every existing one, so it lands at the end of the
 * catalogue instead of the front. The input is not mutated.
 *
 * @param {Product[]} [products]
 * @returns {Product[]}
 */
export function orderProducts(products = []) {
  return [...products].sort((a, b) => {
    const byPosition = positionOf(a) - positionOf(b);
    if (byPosition !== 0) return byPosition;

    const byDate = dateOf(a) - dateOf(b);
    if (byDate !== 0) return byDate;

    return String(a?._id ?? "").localeCompare(String(b?._id ?? ""));
  });
}
