// Turning a finished Tee draft into a purchasable Cart line: export the design,
// upload it, and hand the Cart the Custom Tee base plus the design URL.
//
// The pure parts (file name, quantity, readiness) are tested directly; the
// upload is a thin call to the authenticated design endpoint.
import axios from "axios";

/** The quantity a Custom Tee starts at. */
export const DEFAULT_PURCHASE_QUANTITY = 1;

/**
 * The file name an exported design is uploaded (and downloaded) under, from its
 * MIME type.
 *
 * @param {string} type e.g. "image/webp"
 * @returns {string}
 */
export function designFileName(type) {
  const extension =
    type === "image/webp" ? "webp" : type === "image/jpeg" ? "jpg" : "png";
  return `custom-tshirt.${extension}`;
}

/**
 * Coerce a quantity input to a whole number of at least one.
 *
 * @param {unknown} value
 * @returns {number}
 */
export function purchaseQuantity(value) {
  const quantity = Math.floor(Number(value));
  return Number.isFinite(quantity) && quantity >= 1
    ? quantity
    : DEFAULT_PURCHASE_QUANTITY;
}

/**
 * Whether a Tee draft is ready to buy: it has a graphic and a chosen size.
 *
 * @param {{ hasGraphic: boolean, size: string }} draft
 * @returns {boolean}
 */
export function canBuyCustomTee({ hasGraphic, size }) {
  return Boolean(hasGraphic && size);
}

/**
 * Upload an exported design and return its stored URL.
 *
 * @param {object} upload
 * @param {Blob} upload.blob the exported design
 * @param {string} upload.productId the Custom Tee base
 * @param {string} upload.backendUrl
 * @param {string} upload.token
 * @returns {Promise<string>}
 */
export async function uploadDesign({ blob, productId, backendUrl, token }) {
  const form = new FormData();
  form.append("design", blob, designFileName(blob.type));
  form.append("productId", productId);

  const response = await axios.post(`${backendUrl}/api/design/upload`, form, {
    headers: { token },
  });

  return response.data.data.url;
}
