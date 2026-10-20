import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";

import { createDatabaseConnection } from "./databaseConnection.js";
import { createConnectDB } from "../config/mongodb.js";
import { errorHandler } from "../lib/http.js";

/**
 * The database-availability middleware, observed over real HTTP.
 *
 * The connector is injected, so a failure is an ordinary rejected promise
 * rather than a five-second Atlas timeout. The app keeps the production error
 * handler, which is what turns the rejection into the wire response.
 */

/** Stands in for the object Mongoose returns from `connect`. */
const connection = { getClient: () => ({ id: "client" }) };

/**
 * Boot a loopback app whose only route needs the database.
 *
 * @param {() => Promise<unknown>} connectDB
 */
const startProbeServer = async (connectDB) => {
  const app = express();
  app.use(createDatabaseConnection(connectDB));
  app.get("/api/probe", (req, res) => res.json({ success: true }));
  app.use(errorHandler);

  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");

  const { port } = server.address();

  const request = async () => {
    const response = await fetch(`http://127.0.0.1:${port}/api/probe`, {
      headers: { connection: "close" },
    });

    return { status: response.status, body: await response.json() };
  };

  const close = async () => {
    if (!server.listening) return;

    const closed = once(server, "close");
    server.closeAllConnections();
    server.close();
    await closed;
  };

  return { request, close };
};

test("an unavailable database answers 503 and the next request retries", async (t) => {
  t.mock.method(console, "log", () => {});

  let attempts = 0;
  const connectDB = createConnectDB({
    uri: "mongodb://example.test/forever",
    connect: async () => {
      attempts += 1;
      if (attempts === 1) {
        throw new Error("Could not connect to any servers in your cluster");
      }
      return connection;
    },
  });

  const server = await startProbeServer(connectDB);
  t.after(() => server.close());

  const started = process.hrtime.bigint();
  const failed = await server.request();
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;

  assert.equal(failed.status, 503);
  assert.deepEqual(failed.body, {
    success: false,
    message: "Something went wrong. Please try again later.",
  });
  assert.ok(elapsedMs < 1000, `expected a fast failure, took ${elapsedMs}ms`);

  const recovered = await server.request();

  assert.equal(recovered.status, 200);
  assert.deepEqual(recovered.body, { success: true });
  assert.equal(attempts, 2);
});

test("a healthy connection is reused across requests", async (t) => {
  t.mock.method(console, "log", () => {});

  let attempts = 0;
  const connectDB = createConnectDB({
    uri: "mongodb://example.test/forever",
    connect: async () => {
      attempts += 1;
      return connection;
    },
  });

  const server = await startProbeServer(connectDB);
  t.after(() => server.close());

  assert.equal((await server.request()).status, 200);
  assert.equal((await server.request()).status, 200);
  assert.equal(attempts, 1);
});
