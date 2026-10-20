import jwt from "jsonwebtoken";

import { HttpError } from "../lib/http.js";
import { verifyAdminSessionToken } from "../lib/authTokens.js";

/** Expiry gets its own message so the client knows signing in again will help. */
const EXPIRED_MESSAGE = "Admin session expired, please log in again";
const NOT_AUTHORIZED_MESSAGE = "Not authorized, Login Again";
const INVALID_MESSAGE = "Not authorized, token failed";

/**
 * Authenticate an admin request with an admin Session token.
 *
 * The token must carry the admin role, the admin-session purpose, a valid
 * signature and an unexpired `exp`. Verification lives in the token module so
 * a storefront Session token or Password reset token can never stand in for an
 * admin token. Expiry is reported distinctly from tampering or a wrong role.
 */
export const adminAuth = (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return next(new HttpError(401, NOT_AUTHORIZED_MESSAGE));
  }

  try {
    verifyAdminSessionToken(token);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new HttpError(401, EXPIRED_MESSAGE));
    }

    return next(new HttpError(401, INVALID_MESSAGE));
  }
};

export default adminAuth;
