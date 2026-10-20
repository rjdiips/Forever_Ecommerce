/**
 * Rate limits for the auth endpoints.
 *
 * The limits are per client IP, using express-rate-limit's in-memory store.
 * That store is best-effort on serverless: each instance counts on its own and
 * forgets on a cold start (see ADR-0008). It still slows sustained guessing.
 *
 * The app trusts one proxy hop, so `req.ip` is the real client rather than the
 * proxy. Rejections go through the shared error handler, which keeps them in
 * the usual `{ success: false, message }` envelope.
 */
import rateLimit from "express-rate-limit";
import { HttpError } from "../lib/http.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_MESSAGE =
  "Too many attempts. Please try again in a few minutes.";

/**
 * Build a limiter for one auth tier.
 *
 * @param {number} limit Allowed requests per client IP per window.
 * @returns {import("express").RequestHandler}
 */
const authLimiter = (limit) =>
  rateLimit({
    windowMs: WINDOW_MS,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) =>
      next(new HttpError(429, MAX_ATTEMPTS_MESSAGE)),
  });

/** Login: 10 requests per 15 minutes per client IP. */
export const loginRateLimit = authLimiter(10);

/** Registration: 10 requests per 15 minutes per client IP. */
export const registerRateLimit = authLimiter(10);

/** Admin sign-in: 5 requests per 15 minutes per client IP. */
export const adminLoginRateLimit = authLimiter(5);

/** Forgot password: 5 requests per 15 minutes per client IP. */
export const forgotPasswordRateLimit = authLimiter(5);

/** Reset password: 5 requests per 15 minutes per client IP. */
export const resetPasswordRateLimit = authLimiter(5);
