// The storefront reserves 401 for a Session token the API will not accept
// (expired or revoked). Bad credentials are a 400 by design, so only 401 signs
// the Customer out.
export const isRejectedSession = (error) => error?.response?.status === 401;

export const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please log in again.";

// Reusing the id stops a burst of 401s from stacking identical toasts.
export const SESSION_EXPIRED_TOAST_ID = "session-expired";

/**
 * The message to show for a rejected Session token.
 *
 * The API distinguishes an expired token from a malformed or revoked one, so
 * keep its wording when present; the local expiry message is only a fallback.
 *
 * @param {unknown} error
 * @returns {string}
 */
export const sessionRejectionMessage = (error) => {
  const message = error?.response?.data?.message;

  return typeof message === "string" && message.trim()
    ? message
    : SESSION_EXPIRED_MESSAGE;
};

export const isLoginPage = (pathname = "") =>
  pathname.replace(/\/+$/, "") === "/login";
