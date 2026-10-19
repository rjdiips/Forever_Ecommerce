// Pure cart math. A Cart line is `{ productId, size, quantity }` and money is
// integer cents. The catalogue enters only through a `priceOf` lookup, so
// everything here is testable without React, the API or a browser.
import { toCents } from "@forever/shared";

/** The identity of a Cart line: its product and its size. */
export function lineId({ productId, size }) {
  return `${productId}::${size}`;
}

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

/** Appends `line` to `lines`, merging into the matching line if it exists. */
export function addLine(lines, { productId, size, quantity = 1 }) {
  const id = lineId({ productId, size });
  const existing = lines.find((line) => lineId(line) === id);

  if (!existing) {
    return [...lines, { productId, size, quantity }];
  }

  return lines.map((line) =>
    lineId(line) === id ? { ...line, quantity: line.quantity + quantity } : line
  );
}

/** Removes the line with `id` and returns a new array. */
function removeLine(lines, id) {
  return lines.filter((line) => lineId(line) !== id);
}

/** Sets the matching line's quantity; a quantity of zero or less drops it. */
export function setQuantity(lines, id, quantity) {
  if (quantity <= 0) {
    return removeLine(lines, id);
  }

  return lines.map((line) => (lineId(line) === id ? { ...line, quantity } : line));
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

/**
 * Turns the saved cart (`{ [productId]: { [size]: quantity } }`) into lines,
 * dropping lines that were emptied.
 */
export function linesFromCartData(cartData = {}) {
  return Object.entries(cartData).flatMap(([productId, sizes]) =>
    Object.entries(sizes ?? {})
      .filter(([, quantity]) => quantity > 0)
      .map(([size, quantity]) => ({ productId, size, quantity }))
  );
}

