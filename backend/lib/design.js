/**
 * The rules a design must satisfy, kept pure so they can be tested without
 * Cloudinary, multer or a database.
 */
import { isCustomTee } from "@forever/shared";
import validator from "validator";
import { HttpError } from "./http.js";

/** The image types the tee editor can export. @type {string[]} */
export const DESIGN_TYPES = ["image/webp", "image/png", "image/jpeg"];

/** Largest design we accept, in bytes. The editor aims for 500 KB or less. */
export const MAX_DESIGN_BYTES = 2 * 1024 * 1024;

/**
 * Throw unless `file` is an acceptable design upload.
 *
 * @param {{ mimetype: string, size: number } | undefined} file the multer file
 */
export function validateDesignUpload(file) {
  if (!file) {
    throw new HttpError(400, "Please choose a design image");
  }

  if (!DESIGN_TYPES.includes(file.mimetype)) {
    throw new HttpError(400, "A design must be a WebP, PNG or JPEG image");
  }

  if (file.size > MAX_DESIGN_BYTES) {
    throw new HttpError(400, "That design is too large (2 MB maximum)");
  }
}

/**
 * Throw unless `product` is the custom-tee base a design may be attached to.
 *
 * @param {{ kind?: string } | null | undefined} product
 */
export function assertDesignTarget(product) {
  if (!isCustomTee(product)) {
    throw new HttpError(400, "Designs can only be made for the Custom Tee");
  }
}

/**
 * Throw unless `design` is the URL of an uploaded image.
 *
 * The URL is what a Cart line and an Order item carry, so it must not be a
 * `data:` URI, a script URL or anything else a browser might execute.
 *
 * @param {unknown} design
 */
export function assertDesignUrl(design) {
  if (
    typeof design !== "string" ||
    !validator.isURL(design, { protocols: ["http", "https"] })
  ) {
    throw new HttpError(400, "A design must be an uploaded image");
  }
}
