/**
 * Cart lines, shared by the shop and the API.
 *
 * A Cart line is `{ productId, size, quantity, design? }`. The `design` is the
 * uploaded design URL of a Custom Tee, so it is part of the line's identity: the
 * same base Product in the same size can be bought twice with two designs.
 *
 * The Cart is saved on the user document. Older carts were stored as
 * `{ [productId]: { [size]: quantity } }`; {@link cartLines} reads both that
 * shape and the line array written since Custom Tees became orderable.
 *
 * @typedef {object} CartLine
 * @property {string} productId
 * @property {string} size
 * @property {number} quantity
 * @property {string} [design] the uploaded design URL, Custom Tee only
 */

/**
 * The identity of a Cart line: its Product, its size, and its design when it
 * carries one. Two Custom Tees with different designs are different lines.
 *
 * @param {{ productId: string, size: string, design?: string }} line
 * @returns {string}
 */
export function cartLineId({ productId, size, design }) {
  const base = `${productId}::${size}`;
  return design ? `${base}::${design}` : base;
}

/**
 * Append `line` to `lines`, merging into the matching line when one exists.
 *
 * @param {CartLine[]} lines
 * @param {CartLine} line
 * @returns {CartLine[]}
 */
export function addCartLine(lines, { productId, size, quantity = 1, design }) {
  const id = cartLineId({ productId, size, design });
  const existing = lines.find((line) => cartLineId(line) === id);

  if (!existing) {
    return [
      ...lines,
      {
        productId,
        size,
        quantity,
        ...(design ? { design } : {}),
      },
    ];
  }

  return lines.map((line) =>
    cartLineId(line) === id ? { ...line, quantity: line.quantity + quantity } : line
  );
}

/**
 * Set the matching line's quantity; a quantity of zero or less drops it.
 *
 * @param {CartLine[]} lines
 * @param {string} id
 * @param {number} quantity
 * @returns {CartLine[]}
 */
export function setCartLineQuantity(lines, id, quantity) {
  if (quantity <= 0) {
    return lines.filter((line) => cartLineId(line) !== id);
  }

  return lines.map((line) => (cartLineId(line) === id ? { ...line, quantity } : line));
}

/**
 * Turn the saved Cart into lines, dropping emptied entries.
 *
 * Accepts the current line array and the legacy `{ [productId]: { [size]:
 * quantity } }` object, so a Cart saved before this ticket still loads.
 *
 * @param {CartLine[] | Record<string, Record<string, number>> | null | undefined} cartData
 * @returns {CartLine[]}
 */
export function cartLines(cartData = []) {
  if (Array.isArray(cartData)) {
    return cartData
      .filter(
        (line) =>
          line && line.productId && line.size && Number(line.quantity) > 0
      )
      .map((line) => ({
        productId: String(line.productId),
        size: line.size,
        quantity: Number(line.quantity),
        ...(line.design ? { design: line.design } : {}),
      }));
  }

  return Object.entries(cartData ?? {}).flatMap(([productId, sizes]) =>
    Object.entries(sizes ?? {})
      .filter(([, quantity]) => quantity > 0)
      .map(([size, quantity]) => ({ productId, size, quantity }))
  );
}
