// Pure cart math. A Cart line is `{ productId, size, quantity, design? }` and
// money is integer cents. The catalogue enters only through a `priceOf` lookup,
// so everything here is testable without React, the API or a browser.
//
// Line identity (product + size + design) lives in `@forever/shared` because
// the API persists the same Cart lines.
import { toCents } from "@forever/shared";

/**
 * Builds the `priceOf(productId) → cents` lookup from the catalogue. Unknown
 * products price at zero.
 */
export function priceOfFromProducts(products = []) {
  const prices = new Map(
    products.map((product) => [product._id, toCents(product.price)])
  );
  return (productId) => prices.get(productId) ?? 0;
}

/**
 * Turns the lines into display lines by pricing each one from the catalogue:
 * `unitPrice` and `total` are integer cents.
 */
export function pricedLines(lines, priceOf) {
  return lines.map((line) => {
    const unitPrice = priceOf(line.productId);
    return { ...line, unitPrice, total: unitPrice * line.quantity };
  });
}

/** The total number of items in the cart. */
export function count(lines) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

/** The sum of every priced line's total, in cents. */
export function subtotal(priced) {
  return priced.reduce((sum, line) => sum + line.total, 0);
}

/**
 * The cart total in cents: the subtotal plus the delivery fee, except on an
 * empty cart, which costs nothing.
 */
export function total(subtotalCents, deliveryFee) {
  return subtotalCents === 0 ? 0 : subtotalCents + deliveryFee;
}
