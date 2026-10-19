/**
 * The API base URL the shop and the admin call.
 *
 * A missing value is a configuration error, not something to paper over at
 * request time: every API call would otherwise target `undefined/api/...`.
 * Validating once, when the config module loads, stops the app at startup with
 * one clear message instead.
 *
 * @param {string | null | undefined} value the raw value from the environment
 * @returns {string} the trimmed, usable base URL
 * @throws {Error} when the value is missing, blank or whitespace-only
 */
export function requireApiBaseUrl(value) {
  const url = typeof value === "string" ? value.trim() : "";

  if (!url) {
    throw new Error(
      "VITE_BACKEND_URL is required: set it to the API base URL (for example https://api.example.com).",
    );
  }

  return url;
}
