// Product images are stored in Cloudinary as 390x450 uploads. The catalogue
// grid shows them near native size; the product page shows them larger, so we
// ask Cloudinary to deliver a 2x, auto-formatted copy and let the browser
// downsample it. That reads sharper than enlarging the 390px original.
//
// `e_upscale` was tried and rejected: it tripled the file size for no visible
// gain. `w_780` is the sweet spot — enough pixels for the ~527px plate without
// inventing a 3x image.
const CLOUDINARY_UPLOAD =
  /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//;

/**
 * A delivery URL for a catalogue image.
 *
 * @param {unknown} url the stored Cloudinary URL
 * @param {number} [width] requested pixel width
 * @returns {string} the transformed URL, or the input when it is not a
 *   Cloudinary upload
 */
export function productImage(url, width = 780) {
  if (typeof url !== "string" || url === "") return url;

  return url.replace(
    CLOUDINARY_UPLOAD,
    (upload) => `${upload}f_auto,q_auto:best,w_${width},c_scale/`
  );
}
