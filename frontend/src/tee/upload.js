// Uploaded graphics are downscaled before they reach the canvas. The editor
// draws in 1000x1000 canvas space (see geometry.js), so a 12 MP phone photo
// costs decode time and memory on every drag without adding any detail.

/** The longest edge an uploaded graphic is kept at. */
export const MAX_GRAPHIC_DIMENSION = 1000;

/**
 * The size that fits `width`x`height` inside `maxDimension` while keeping its
 * aspect ratio, never scaling up. `null` when the source has no usable size.
 *
 * @param {number} width
 * @param {number} height
 * @param {number} [maxDimension]
 * @returns {{ width: number, height: number } | null}
 */
export function scaledSize(width, height, maxDimension = MAX_GRAPHIC_DIMENSION) {
  if (!Number.isFinite(width) || width <= 0) return null;
  if (!Number.isFinite(height) || height <= 0) return null;
  if (!Number.isFinite(maxDimension) || maxDimension <= 0) return null;

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that image."));
    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/**
 * Prepare an uploaded file for the editor and return an object URL to draw.
 *
 * Images already within the limit are returned untouched; larger ones are
 * re-encoded as WebP. A file the browser cannot decode falls back to its
 * original URL, so an unusual format still reaches the existing error path
 * instead of failing silently. The caller owns the returned URL and must
 * revoke it.
 *
 * @param {File} file
 * @param {number} [maxDimension]
 * @returns {Promise<string>}
 */
export async function downscaleGraphicFile(
  file,
  maxDimension = MAX_GRAPHIC_DIMENSION
) {
  const originalUrl = URL.createObjectURL(file);

  let image;
  try {
    image = await loadImage(originalUrl);
  } catch {
    return originalUrl;
  }

  const size = scaledSize(image.naturalWidth, image.naturalHeight, maxDimension);
  if (
    !size ||
    (image.naturalWidth <= maxDimension && image.naturalHeight <= maxDimension)
  ) {
    return originalUrl;
  }

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext("2d").drawImage(image, 0, 0, size.width, size.height);

  const blob = await canvasToBlob(canvas, "image/webp", 0.9);
  if (!blob) return originalUrl;

  URL.revokeObjectURL(originalUrl);
  return URL.createObjectURL(blob);
}
