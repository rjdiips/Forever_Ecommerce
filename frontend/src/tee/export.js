import { CANVAS_SIZE } from "./geometry";

export const EXPORT_MAX_BYTES = 500 * 1024;
// Tried in order until the blob fits the budget. Browsers that cannot encode
// WebP (Safari) return PNG on the first pass and are accepted as-is.
export const EXPORT_QUALITIES = [0.9, 0.6, 0.4];
export const TEE_CROP_MARGIN = 0.02;

const ALPHA_THRESHOLD = 8;

// Tight bounding box of the non-transparent pixels, or null for a blank image.
export function teeBoundingBox(imageData, alphaThreshold = ALPHA_THRESHOLD) {
  const { data, width, height } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0 || maxY < 0) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

// Expands a box by `marginRatio` of the canvas and clamps it to the canvas.
// A null box (blank canvas) yields the whole canvas.
export function cropRect(box, canvasSize = CANVAS_SIZE, marginRatio = TEE_CROP_MARGIN) {
  const base = box ?? { x: 0, y: 0, width: canvasSize, height: canvasSize };
  const margin = Math.round(canvasSize * marginRatio);
  const x = Math.max(0, Math.floor(base.x) - margin);
  const y = Math.max(0, Math.floor(base.y) - margin);
  const right = Math.min(canvasSize, Math.ceil(base.x + base.width) + margin);
  const bottom = Math.min(canvasSize, Math.ceil(base.y + base.height) + margin);
  return { x, y, width: Math.max(1, right - x), height: Math.max(1, bottom - y) };
}

export function isWithinBudget(blob, maxBytes = EXPORT_MAX_BYTES) {
  return Boolean(blob) && blob.size <= maxBytes;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not export the design."))),
      type,
      quality
    );
  });
}

export async function encodeWithinBudget(canvas, maxBytes = EXPORT_MAX_BYTES) {
  let smallest = null;
  for (const quality of EXPORT_QUALITIES) {
    const blob = await canvasToBlob(canvas, "image/webp", quality);
    // Not WebP: this browser silently fell back (e.g. Safari -> PNG), and
    // quality has no effect, so keep what we got.
    if (blob.type !== "image/webp") return blob;
    if (isWithinBudget(blob, maxBytes)) return blob;
    if (!smallest || blob.size < smallest.size) smallest = blob;
  }
  return smallest;
}

// Crops the live canvas to the tee and encodes it.
export async function exportTeeBlob(canvas, maxBytes = EXPORT_MAX_BYTES) {
  const { width, height } = canvas;
  const context = canvas.getContext("2d");
  const box = teeBoundingBox(context.getImageData(0, 0, width, height));
  const rect = cropRect(box, width, TEE_CROP_MARGIN);

  const output = document.createElement("canvas");
  output.width = rect.width;
  output.height = rect.height;
  output
    .getContext("2d")
    .drawImage(canvas, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);

  return encodeWithinBudget(output, maxBytes);
}
