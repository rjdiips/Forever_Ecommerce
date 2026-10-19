/**
 * Money is integer cents everywhere inside the codebase. `Cents` is the
 * canonical representation; major units (dollars, euros) exist only at the
 * edges, and only for display or for a payment provider.
 *
 * @typedef {number} Cents
 */

/** ISO 4217 code of the currency the shop prices in. @type {string} */
export const CURRENCY = "USD";

const CENTS_PER_UNIT = 100;

/**
 * Converts an amount in major units to integer cents.
 *
 * @param {number} amount e.g. 19.99
 * @returns {Cents} e.g. 1999
 */
export function toCents(amount) {
  return Math.round(amount * CENTS_PER_UNIT);
}

/**
 * Converts integer cents back to major units.
 *
 * @param {Cents} cents e.g. 1999
 * @returns {number} e.g. 19.99
 */
export function fromCents(cents) {
  return cents / CENTS_PER_UNIT;
}

/**
 * Formats integer cents for display, e.g. `formatMoney(1999)` → `"$19.99"`.
 *
 * @param {Cents} cents
 * @param {string} [currency] ISO 4217 code, defaults to {@link CURRENCY}.
 * @returns {string}
 */
export function formatMoney(cents, currency = CURRENCY) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(fromCents(cents));
}
