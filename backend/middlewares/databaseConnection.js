import connectDB from "../config/mongodb.js";
import { HttpError } from "../lib/http.js";

/**
 * Make a request wait for the database connection.
 *
 * Mounted before the database-backed routers. Awaiting the shared connector
 * means a cold instance opens at most one connection; when the attempt fails
 * the connector clears its cache, so the next request retries instead of
 * leaving the instance permanently broken.
 *
 * A failed connection is a service-unavailable error: the shared error handler
 * answers 503 with the standard failure envelope. The underlying reason is
 * logged by the connector, not exposed to the client.
 *
 * @param {() => Promise<unknown>} connect
 * @returns {import("express").RequestHandler}
 */
export const createDatabaseConnection = (connect) => async (req, res, next) => {
  try {
    await connect();
    next();
  } catch {
    next(new HttpError(503, "Database unavailable"));
  }
};

const databaseConnection = createDatabaseConnection(connectDB);

export default databaseConnection;
