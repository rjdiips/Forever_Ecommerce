/**
 * The password rules and reset copy the shop and the API must agree on.
 *
 * Keeping the minimum and the wording here stops the sign-up form, the reset
 * page and the API from drifting into three different answers.
 */

/** The shortest password accepted at sign-up and reset. */
export const MIN_PASSWORD_LENGTH = 6;

/**
 * The one message for a password below the minimum.
 *
 * @param {number} [minimum]
 * @returns {string}
 */
export const passwordTooShortMessage = (minimum = MIN_PASSWORD_LENGTH) =>
  `Password should be at least ${minimum} characters`;

/**
 * The confirmation shown whether or not an account exists, so the reset request
 * cannot be used to discover registered emails.
 */
export const GENERIC_PASSWORD_RESET_CONFIRMATION =
  "If an account with that email exists, a password reset link has been sent.";
