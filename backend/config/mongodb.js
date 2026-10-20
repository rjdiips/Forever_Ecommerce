import mongoose from "mongoose";
import { attachDatabasePool } from "@vercel/functions";
import { log } from "../lib/log.js";

// Many short-lived function instances share one Atlas cluster, so a large
// per-instance pool would exhaust the connection limit. Keep it small.
const MAX_POOL_SIZE = 5;

// A cold instance that cannot reach Atlas should fail in seconds, not sit on
// Mongoose's ten-second default while the request waits.
const SERVER_SELECTION_TIMEOUT_MS = 5000;

/**
 * Build a `connectDB` around an injectable Mongoose client.
 *
 * The returned function caches one connection promise so concurrent cold
 * requests share a single attempt. A rejected attempt is not cached: the next
 * caller retries, which is what lets an instance recover after a transient
 * Atlas failure instead of staying broken forever.
 *
 * @param {{
 *   uri?: string,
 *   onVercel?: boolean,
 *   connect?: (uri: string, options: object) => Promise<unknown>,
 *   attachPool?: (client: unknown) => void,
 * }} [options]
 * @returns {() => Promise<unknown>}
 */
export const createConnectDB = ({
  uri,
  onVercel = false,
  connect = async (url, options) => {
    await mongoose.connect(url, options);
    // The pool is registered against the connection's client, not the
    // Mongoose instance that `connect()` resolves to.
    return mongoose.connection;
  },
  attachPool = (client) => attachDatabasePool(client),
} = {}) => {
  /** @type {Promise<unknown> | null} */
  let pending = null;
  let reportedMissingUri = false;

  return () => {
    if (pending) return pending;

    if (!uri) {
      // A missing URI is a configuration error, not a transient one: log it
      // once rather than on every request that fails.
      if (!reportedMissingUri) {
        reportedMissingUri = true;
        log.error("ATLASDB_URI is not set; database requests will fail");
      }
      return Promise.reject(
        new Error("ATLASDB_URI is not set; cannot connect to mongodb")
      );
    }

    pending = (async () => {
      try {
        const connection = await connect(uri, {
          maxPoolSize: MAX_POOL_SIZE,
          serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
        });

        // On Fluid compute, register the client so idle connections are
        // released before the instance suspends. The helper is only meaningful
        // on Vercel.
        if (onVercel) {
          attachPool(connection.getClient());
        }

        log.info("Connected to mongodb database");
        return connection;
      } catch (error) {
        // Never process.exit(): on a serverless host that turns a transient
        // database failure (pause, network blip, bad credential) into a total
        // outage for every route. Clear the cache so the next request retries.
        pending = null;
        log.error("Failed to connect to mongodb", { error: error.message });
        throw error;
      }
    })();

    return pending;
  };
};

const connectDB = createConnectDB({
  uri: process.env.ATLASDB_URI,
  onVercel: Boolean(process.env.VERCEL),
});

export default connectDB;
