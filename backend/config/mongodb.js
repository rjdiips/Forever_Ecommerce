import mongoose from "mongoose";
import { attachDatabasePool } from "@vercel/functions";
import { log } from "../lib/log.js";

const dbURL = process.env.ATLASDB_URI;

// Many short-lived function instances share one Atlas cluster, so a large
// per-instance pool would exhaust the connection limit. Keep it small.
const MAX_POOL_SIZE = 5;

const connectDB = async () => {
  if (!dbURL) {
    log.error("ATLASDB_URI is not set; skipping database connection");
    return;
  }

  try {
    await mongoose.connect(dbURL, { maxPoolSize: MAX_POOL_SIZE });

    // On Fluid compute, register the client so idle connections are released
    // before the instance suspends. The helper is only meaningful on Vercel.
    if (process.env.VERCEL) {
      attachDatabasePool(mongoose.connection.getClient());
    }

    log.info("Connected to mongodb database");
  } catch (error) {
    // Never process.exit(): on a serverless host that turns a transient
    // database failure (pause, network blip, bad credential) into a total
    // outage for every route. Log it and stay up; requests that need the
    // database will fail on their own.
    log.error("Failed to connect to mongodb", { error: error.message });
  }
};

export default connectDB;
