// The blank the tee generator designs onto, fetched from the Tee base's image
// rather than bundled with the app (ADR-0005).
//
// Cloudinary serves the stored upload; we ask it for a square, auto-formatted
// copy at read time so the drawing space is always the same shape. The stored
// upload is never changed. A URL Cloudinary does not serve has no transform to
// apply, so it is requested as-is; a base with no image has no URL at all.

/** The Cloudinary transform that makes every blank a square. */
const BLANK_TRANSFORM = "f_auto,q_auto,w_1600,h_1600,c_fill";

/** A Cloudinary image delivery URL, up to and including `/image/upload/`. */
const CLOUDINARY_UPLOAD = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//;

/**
 * The URL to request a Tee base's blank from.
 *
 * @param {unknown} imageUrl the base's stored image URL
 * @returns {string | null} the transformed URL, the URL unchanged when it is
 *   not a Cloudinary upload, or null when there is no image
 */
export function teeBlankUrl(imageUrl) {
  if (typeof imageUrl !== "string" || imageUrl === "") return null;

  return imageUrl.replace(CLOUDINARY_UPLOAD, (upload) => `${upload}${BLANK_TRANSFORM}/`);
}
