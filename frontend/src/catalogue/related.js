// Pure related-products selection. A Related Product shares the Product's
// category and sub-category, never includes the Product itself, and is capped
// at the caller's limit. The component owns the transition timing; this file
// owns only the rule, so it can be tested without React or the API.

/** The number of related products the product page shows. */
export const RELATED_LIMIT = 5;

/**
 * The Products related to `product`: same category and sub-category, itself
 * excluded, at most `limit`.
 *
 * @param {Array<object>} products the shop catalogue
 * @param {{ _id?: unknown, category?: string, subCategory?: string } | null | undefined} product
 * @param {number} [limit]
 * @returns {Array<object>}
 */
export function relatedTo(products = [], product, limit = RELATED_LIMIT) {
  if (!product) return [];

  const count = Math.max(0, Math.floor(limit));

  return products
    .filter((item) => String(item._id) !== String(product._id))
    .filter(
      (item) =>
        item.category === product.category &&
        item.subCategory === product.subCategory
    )
    .slice(0, count);
}
