/**
 * The API's request seam.
 *
 * Every route handler returns its data (or throws); this module owns the wire
 * shape so the handlers never touch `res`. Success is `{ success: true, message?, data? }`;
 * failure is `{ success: false, message }`, produced by {@link errorHandler}.
 *
 * @typedef {import("express").RequestHandler} RequestHandler
 */
import { log } from "./log.js";

const GENERIC_SERVER_MESSAGE = "Something went wrong. Please try again later.";

/**
 * An error that carries the HTTP status the client should see.
 *
 * Handlers throw these for expected failures; {@link errorHandler} turns them
 * into the failure envelope.
 */
export class HttpError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   */
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

/**
 * Wrap a data-returning handler in an Express middleware.
 *
 * @param {(req: import("express").Request) => unknown | Promise<unknown>} handler
 * @param {{ status?: number, message?: string }} [options]
 * @returns {RequestHandler}
 */
export const route = (handler, options = {}) => {
  const status = options.status ?? 200;
  const { message } = options;

  return (req, res, next) =>
    Promise.resolve()
      .then(() => handler(req))
      .then((data) => {
        const body = { success: true };
        if (message !== undefined) body.message = message;
        if (data !== undefined) body.data = data;
        res.status(status).json(body);
      })
      .catch(next);
};

/**
 * The one error path, registered last.
 *
 * An {@link HttpError} (or any error carrying a `status`) decides the status
 * code: 4xx messages pass through to the client, 5xx are replaced with a
 * generic message and logged with the request id and stack.
 *
 * @type {import("express").ErrorRequestHandler}
 */
export const errorHandler = (err, req, res, next) => {
  // If a response has already started, the only safe move is to hand the error
  // back to Express's default handler.
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status ?? 500;

  if (status >= 500) {
    log.error("request failed", {
      requestId: req.id,
      error: err.message,
      stack: err.stack,
    });
    res.status(status).json({ success: false, message: GENERIC_SERVER_MESSAGE });
    return;
  }

  res.status(status).json({ success: false, message: err.message });
};
