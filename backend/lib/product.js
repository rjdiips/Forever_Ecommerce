/**
 * The rules a Product must satisfy before it is stored, kept pure so they can
 * be tested without a database, multer or Cloudinary.
 */
import {
  PRODUCT_KIND,
  normalizeProductKind,
  normalizeTeeColor,
} from "@forever/shared";
import { HttpError } from "./http.js";

/**
 * The colour to store on a Product.
 *
 * A Tee base must name a colour from the shared vocabulary — one base per
 * colour — so the storefront can never be handed a base it cannot use. Every
 * other Product carries no colour at all, whatever the request asked for, and
 * a malformed colour is no colour rather than an unrecognised one.
 *
 * @param {unknown} kind the untrusted product kind from the request
 * @param {unknown} color the untrusted colour from the request
 * @returns {string | null} the colour to store, or null for no colour
 */
export function resolveProductColor(kind, color) {
  if (normalizeProductKind(kind) !== PRODUCT_KIND.CUSTOM_TEE) {
    return null;
  }

  const teeColor = normalizeTeeColor(color);
  if (teeColor === null) {
    throw new HttpError(400, "A Custom Tee base needs a colour");
  }

  return teeColor;
}
