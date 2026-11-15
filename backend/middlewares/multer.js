import multer from "multer";
import { HttpError } from "../lib/http.js";

// Uploads are buffered in memory and streamed straight to Cloudinary, so
// nothing is written to disk: two uploads can no longer collide on the
// original file name, and no temp files are left behind.
const storage = multer.memoryStorage();

/** A limit breach is the caller's error, so it becomes a 400, never a 500. */
const MESSAGES = {
  LIMIT_FILE_SIZE: "That upload is too large",
  LIMIT_FILE_COUNT: "That is too many files",
  LIMIT_PART_COUNT: "That upload has too many parts",
  LIMIT_FIELD_COUNT: "That upload has too many fields",
  LIMIT_UNEXPECTED_FILE: "That upload field is not accepted",
};

/**
 * Run a multer middleware and translate its errors into the API's envelope.
 *
 * @param {import("express").RequestHandler} middleware
 * @returns {import("express").RequestHandler}
 */
const clientErrors = (middleware) => (req, res, next) =>
  middleware(req, res, (error) => {
    if (!error) return next();

    return next(
      error instanceof multer.MulterError
        ? new HttpError(400, MESSAGES[error.code] ?? "That upload is not valid")
        : error
    );
  });

/**
 * Build an upload handler whose limits are enforced while the body streams.
 *
 * `limits.fileSize` is the part that matters: without it the whole multipart
 * body is buffered in memory before any controller can check its size, so the
 * error is answered only after the allocation has been paid for.
 *
 * `maxFileSize` is the largest file that is accepted. The parser signals its
 * limit when the byte count *reaches* the configured value, hence the +1.
 *
 * @param {{ maxFileSize: number, maxFiles?: number, maxFields?: number }} limits
 */
export const createUpload = ({
  maxFileSize,
  maxFiles = 1,
  maxFields = 20,
}) => {
  const upload = multer({
    storage,
    limits: {
      fileSize: maxFileSize + 1,
      files: maxFiles,
      fields: maxFields,
    },
  });

  return {
    /** @param {string} field */
    single: (field) => clientErrors(upload.single(field)),
    /** @param {import("multer").Field[]} fields */
    fields: (fields) => clientErrors(upload.fields(fields)),
  };
};
