/**
 * The pricing rules for an Order, kept pure so they can be tested without
 * MongoDB or Stripe.
 *
 * The client sends intent only — `{ productId, size, quantity, design? }` — and
 * every price comes from the Product in the catalogue. Any `price`, `amount` or
 * `total` on the request is ignored. See ADR-0002.
 */
import { DELIVERY_FEE, toCents } from "@forever/shared";
import { assertDesignTarget } from "./design.js";
import { HttpError } from "./http.js";

/**
 * @typedef {object} OrderIntentLine
 * @property {string} productId
 * @property {string} size
 * @property {number} quantity
 * @property {string} [design] the uploaded design URL, Custom Tee only
 */

/**
 * @typedef {object} PricedOrderItem
 * @property {string} productId
 * @property {string} name
 * @property {string[]} image
 * @property {number} price unit price in integer cents
 * @property {string} size
 * @property {number} quantity
 * @property {string} [design]
 */

/**
 * @typedef {object} PricedOrder
 * @property {PricedOrderItem[]} items
 * @property {number} subtotal integer cents
 * @property {number} deliveryFee integer cents
 * @property {number} amount integer cents, delivery included
 */

/**
 * Price an Order from the catalogue.
 *
 * Throws a 400 for anything a shopper cannot buy: an empty cart, an unknown
 * Product, a size the Product does not offer, a bad quantity, or a design on a
 * Product that is not the Custom Tee base.
 *
 * @param {OrderIntentLine[]} items
 * @param {Array<{ _id: unknown, name: string, price: number, image?: string[], sizes?: string[], kind?: string }>} products
 * @param {number} [deliveryFee]
 * @returns {PricedOrder}
 */
export function priceOrder(items, products = [], deliveryFee = DELIVERY_FEE) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Your cart is empty");
  }

  const catalogue = new Map(products.map((product) => [String(product._id), product]));

  const pricedItems = items.map((item) => {
    const product = catalogue.get(String(item?.productId));

    if (!product) {
      throw new HttpError(400, "One of the products is no longer available");
    }

    if (!Array.isArray(product.sizes) || !product.sizes.includes(item.size)) {
      throw new HttpError(400, `Please choose an available size for ${product.name}`);
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new HttpError(400, "Quantity must be a whole number of at least 1");
    }

    const hasDesign = item.design !== undefined;

    if (hasDesign) {
      assertDesignTarget(product);

      if (!isHttpUrl(item.design)) {
        throw new HttpError(400, "A design must be an uploaded image");
      }
    }

    return {
      productId: String(product._id),
      name: product.name,
      image: product.image ?? [],
      price: toCents(product.price),
      size: item.size,
      quantity: item.quantity,
      ...(hasDesign ? { design: item.design } : {}),
    };
  });

  const subtotal = pricedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    items: pricedItems,
    subtotal,
    deliveryFee,
    amount: subtotal + deliveryFee,
  };
}

/** Is `value` an absolute http(s) URL, as Cloudinary returns? */
function isHttpUrl(value) {
  if (typeof value !== "string" || value.trim() === "") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
