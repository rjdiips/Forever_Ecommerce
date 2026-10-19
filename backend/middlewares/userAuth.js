import jwt from "jsonwebtoken";

import UserModel from "../models/userModel.js";
import { HttpError } from "../lib/http.js";
import {
  TOKEN_PURPOSE,
  isCurrentToken,
  verifySessionToken,
} from "../lib/authTokens.js";

const EXPIRED_MESSAGE = "Session expired, please log in again";
const NOT_AUTHORIZED_MESSAGE = "Not authorized, Login again";
const INVALID_MESSAGE = "Not authorized, token failed";

/**
 * Authenticate a storefront request with a Session token.
 *
 * The token must be a current Session token (`purpose`, signature and expiry),
 * and its `tokenVersion` must match the User's current version. Expiry gets its
 * own message so the client can tell "sign in again" apart from a malformed or
 * revoked token.
 */
export const userAuth = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return next(new HttpError(401, NOT_AUTHORIZED_MESSAGE));
  }

  let payload;

  try {
    payload = verifySessionToken(token);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new HttpError(401, EXPIRED_MESSAGE));
    }

    return next(new HttpError(401, INVALID_MESSAGE));
  }

  if (payload.userId === undefined || payload.userId === null) {
    return next(new HttpError(401, INVALID_MESSAGE));
  }

  try {
    // One indexed lookup by `_id`; only the version is needed.
    const user = await UserModel.findById(payload.userId, "tokenVersion");

    if (!isCurrentToken(payload, user, TOKEN_PURPOSE.SESSION)) {
      return next(new HttpError(401, NOT_AUTHORIZED_MESSAGE));
    }

    req.userId = payload.userId;
    next();
  } catch (error) {
    next(error);
  }
};
