import { randomUUID } from "node:crypto";
import { log } from "../lib/log.js";

/**
 * Give every request a correlation id and log one line when it finishes.
 *
 * The id comes from Vercel's `x-vercel-id` header when present, so our line ties
 * back to the platform's own logs; otherwise we generate one. It is stored on
 * `req.id`, echoed to the client as `x-request-id`, and included in every line so
 * a request and its error (logged by the error handler) can be joined.
 *
 * @type {import("express").RequestHandler}
 */
const requestLogger = (req, res, next) => {
  const incoming = req.headers["x-vercel-id"];
  const requestId =
    (typeof incoming === "string" && incoming) || randomUUID();

  req.id = requestId;
  res.setHeader("x-request-id", requestId);

  const startedAt = process.hrtime.bigint();

  // `finish` fires once the response is sent, so the duration covers the whole
  // request. `req.userId` is set by userAuth when the route is authenticated.
  res.on("finish", () => {
    const status = res.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    log[level]("request", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status,
      durationMs: Math.round(durationMs * 10) / 10,
      userId: req.userId,
    });
  });

  next();
};

export default requestLogger;
