/**
 * The storefront origin used to build links the API emails.
 *
 * A missing value is a configuration error, not something to paper over at
 * request time: a Password reset email would otherwise carry
 * `undefined/reset-password`, which is useless to the User. Validating when the
 * app boots stops the process with one clear message instead.
 *
 * Mirrors `requireApiBaseUrl` in `@forever/shared`: trim, reject blank, and
 * return a value callers can concatenate with a path.
 *
 * @param {string | null | undefined} value the raw value from the environment
 * @returns {string} the trimmed origin, without a trailing slash
 * @throws {Error} when the value is missing, blank or whitespace-only
 */
export function requireFrontendUrl(value) {
  const url = typeof value === "string" ? value.trim() : "";

  if (!url) {
    throw new Error(
      "FRONTEND_URL is required: set it to the storefront origin (for example https://shop.example.com)."
    );
  }

  return url.replace(/\/+$/, "");
}

/**
 * Read and validate the storefront origin from the environment.
 *
 * @returns {string} the trimmed origin, without a trailing slash
 * @throws {Error} when `FRONTEND_URL` is missing or blank
 */
export const getFrontendUrl = () => requireFrontendUrl(process.env.FRONTEND_URL);
