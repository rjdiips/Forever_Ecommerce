/**
 * The auth token module.
 *
 * Every token the API issues is signed and verified here, so the lifetimes and
 * invalidation rules can be read and tested in one place. A token's `purpose`
 * claim is part of its meaning: a Session token authenticates a request, a
 * Password reset token authorises one password change, and an admin Session
 * token authenticates the admin API. Verification always names the purpose it
 * expects, so one kind can never be replayed as another.
 *
 * Session and Password reset tokens also carry `tokenVersion`, the User's
 * version at mint time. Bumping `User.tokenVersion` (on a password change)
 * invalidates every token minted before it. {@link isCurrentToken} is the pure
 * rule for that check; {@link verifySessionToken} only proves the signature,
 * purpose and expiry.
 *
 * Lifetimes are constants, not environment variables: changing how long a
 * Session token lasts is a code change with a test.
 */
import jwt from "jsonwebtoken";

/** The purposes a token can have. Verification always requires the expected one. */
export const TOKEN_PURPOSE = Object.freeze({
  SESSION: "session",
  ADMIN_SESSION: "admin-session",
  PASSWORD_RESET: "password-reset",
});

/** The only role an admin Session token may carry. */
export const ADMIN_ROLE = "admin";

/**
 * The fixed lifetime of each token kind, in seconds.
 *
 * Kept beside the signers so the promise ("7 days", "12 hours", "30 minutes")
 * and the code cannot drift apart silently.
 */
export const TOKEN_LIFETIME_SECONDS = Object.freeze({
  session: 7 * 24 * 60 * 60,
  adminSession: 12 * 60 * 60,
  passwordReset: 30 * 60,
});

/** A signed token arrived with a valid signature but the wrong purpose. */
export class TokenPurposeError extends Error {
  /**
   * @param {string} expected
   * @param {string | undefined} actual
   */
  constructor(expected, actual) {
    super(`Expected a ${expected} token, got ${actual ?? "none"}`);
    this.name = "TokenPurposeError";
    this.expected = expected;
    this.actual = actual;
  }
}

/** A signed token is missing a claim the token kind requires. */
export class TokenPayloadError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "TokenPayloadError";
  }
}

const secret = () => process.env.JWT_SECRET;

/**
 * @param {Record<string, unknown>} payload
 * @param {number} lifetimeSeconds
 */
const sign = (payload, lifetimeSeconds) =>
  jwt.sign(payload, secret(), { expiresIn: lifetimeSeconds });

/**
 * Build the claims shared by Session and Password reset tokens.
 *
 * @param {string} purpose
 * @param {unknown} userId
 * @param {unknown} tokenVersion
 */
const userClaims = (purpose, userId, tokenVersion) => {
  if (userId === undefined || userId === null || userId === "") {
    throw new TypeError("A user token needs a userId");
  }

  if (!Number.isInteger(tokenVersion) || tokenVersion < 0) {
    throw new TypeError("A user token needs a non-negative integer tokenVersion");
  }

  return { userId: String(userId), tokenVersion, purpose };
};

/**
 * Mint a storefront Session token for a User.
 *
 * @param {unknown} userId
 * @param {number} tokenVersion the User's version when the token is minted
 */
export const signSessionToken = (userId, tokenVersion) =>
  sign(
    userClaims(TOKEN_PURPOSE.SESSION, userId, tokenVersion),
    TOKEN_LIFETIME_SECONDS.session
  );

/**
 * Mint an admin Session token.
 *
 * The payload is an object because `jsonwebtoken` refuses `expiresIn` for a
 * string payload. It deliberately carries no email or password: a token is
 * readable by its bearer, and credentials should never travel inside one.
 */
export const signAdminSessionToken = () =>
  sign(
    { role: ADMIN_ROLE, purpose: TOKEN_PURPOSE.ADMIN_SESSION },
    TOKEN_LIFETIME_SECONDS.adminSession
  );

/**
 * Mint a Password reset token for a User.
 *
 * @param {unknown} userId
 * @param {number} tokenVersion the User's version when the token is minted
 */
export const signPasswordResetToken = (userId, tokenVersion) =>
  sign(
    userClaims(TOKEN_PURPOSE.PASSWORD_RESET, userId, tokenVersion),
    TOKEN_LIFETIME_SECONDS.passwordReset
  );

/**
 * Verify a token's signature and expiry, then require its purpose.
 *
 * `jsonwebtoken`'s `TokenExpiredError` is allowed through unchanged so callers
 * can report expiry distinctly from a malformed, tampered or wrong-purpose
 * token.
 *
 * @param {string} token
 * @param {string} expectedPurpose
 */
const verify = (token, expectedPurpose) => {
  const payload = jwt.verify(token, secret());

  if (payload?.purpose !== expectedPurpose) {
    throw new TokenPurposeError(expectedPurpose, payload?.purpose);
  }

  return payload;
};

/**
 * Verify a storefront Session token.
 *
 * @param {string} token
 * @returns {any}
 */
export const verifySessionToken = (token) =>
  verify(token, TOKEN_PURPOSE.SESSION);

/**
 * Verify an admin Session token.
 *
 * @param {string} token
 * @returns {any}
 */
export const verifyAdminSessionToken = (token) => {
  const payload = verify(token, TOKEN_PURPOSE.ADMIN_SESSION);

  if (payload.role !== ADMIN_ROLE) {
    throw new TokenPayloadError("An admin Session token needs the admin role");
  }

  return payload;
};

/**
 * Verify a Password reset token.
 *
 * @param {string} token
 * @returns {any}
 */
export const verifyPasswordResetToken = (token) =>
  verify(token, TOKEN_PURPOSE.PASSWORD_RESET);

/**
 * Is this verified token still current for this User?
 *
 * Pure, so the invalidation rule is testable without a database. A User saved
 * before `tokenVersion` existed is version 0.
 *
 * @param {{ userId?: unknown, tokenVersion?: unknown, purpose?: unknown }} payload
 * @param {{ _id?: unknown, id?: unknown, tokenVersion?: number } | null | undefined} user
 * @param {string} expectedPurpose
 */
export const isCurrentToken = (payload, user, expectedPurpose) => {
  if (!payload || !user) return false;

  const userId = user._id ?? user.id;

  return (
    payload.purpose === expectedPurpose &&
    payload.userId !== undefined &&
    payload.userId !== null &&
    userId !== undefined &&
    userId !== null &&
    String(payload.userId) === String(userId) &&
    Number.isInteger(payload.tokenVersion) &&
    payload.tokenVersion === (user.tokenVersion ?? 0)
  );
};
