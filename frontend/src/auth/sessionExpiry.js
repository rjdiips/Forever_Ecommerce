// The storefront reserves 401 for a Session token the API will not accept
// (expired or revoked). Bad credentials are a 400 by design, so only 401 signs
// the Customer out.
export const isRejectedSession = (error) => error?.response?.status === 401;

export const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please log in again.";

// Reusing the id stops a burst of 401s from stacking identical toasts.
export const SESSION_EXPIRED_TOAST_ID = "session-expired";

export const isLoginPage = (pathname = "") =>
  pathname.replace(/\/+$/, "") === "/login";
