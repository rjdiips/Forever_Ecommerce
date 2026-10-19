/**
 * The Product taxonomy, shared by the shop filter, the admin add-product form
 * and the API's product validation.
 *
 * A Product has one category and one sub-category; both lists are flat because
 * the shop filters them independently (any sub-category can appear under any
 * category).
 */

/** The categories a Product can belong to. @type {string[]} */
export const CATEGORIES = ["Men", "Women", "Kids"];

/** The sub-categories a Product can belong to. @type {string[]} */
export const SUB_CATEGORIES = ["Topwear", "Bottomwear", "Winterwear"];

/**
 * Whether `value` is one of the known categories.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isCategory(value) {
  return CATEGORIES.includes(value);
}

/**
 * Whether `value` is one of the known sub-categories.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isSubCategory(value) {
  return SUB_CATEGORIES.includes(value);
}
