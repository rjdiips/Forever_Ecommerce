import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import { createConnectDB } from "./mongodb.js";

/**
 * The database connection seam.
 *
 * `createConnectDB` owns the connection policy: one attempt shared by every
 * caller, a fast failure, and a retry on the next caller. The Mongoose client is
 * injected so these tests never open a socket.
 */

/** Stands in for the object Mongoose returns from `connect`. */
const connection = { getClient: () => ({ id: "client" }) };

/** Silence the structured logger for one test; the test restores it. */
const quietLogger = (t) => {
  t.mock.method(console, "log", () => {});
};

test("concurrent callers share one connection attempt", async (t) => {
  quietLogger(t);

  let attempts = 0;
  let release;
  const connectDB = createConnectDB({
    uri: "mongodb://example.test/forever",
    connect: () => {
      attempts += 1;
      return new Promise((resolve) => {
        release = resolve;
      });
    },
  });

  const first = connectDB();
  const second = connectDB();

  release(connection);

  assert.deepEqual(await Promise.all([first, second]), [connection, connection]);
  assert.equal(attempts, 1);
});

test("a successful connection is reused by later callers", async (t) => {
  quietLogger(t);

  let attempts = 0;
  const connectDB = createConnectDB({
    uri: "mongodb://example.test/forever",
    connect: async () => {
      attempts += 1;
      return connection;
    },
  });

  assert.equal(await connectDB(), connection);
  assert.equal(await connectDB(), connection);
  assert.equal(attempts, 1);
});

test("a failed attempt is not cached; the next caller retries", async (t) => {
  quietLogger(t);

  let attempts = 0;
  const connectDB = createConnectDB({
    uri: "mongodb://example.test/forever",
    connect: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("no route to host");
      return connection;
    },
  });

  await assert.rejects(connectDB(), /no route to host/);
  assert.equal(await connectDB(), connection);
  assert.equal(attempts, 2);
});

test("a missing ATLASDB_URI fails without attempting a connection", async (t) => {
  quietLogger(t);

  let attempts = 0;
  const connectDB = createConnectDB({
    uri: undefined,
    connect: async () => {
      attempts += 1;
      return connection;
    },
  });

  await assert.rejects(connectDB(), /ATLASDB_URI is not set/);
  assert.equal(attempts, 0);
});

test("connects with a small pool and a short server selection timeout", async (t) => {
  quietLogger(t);

  let received;
  const connectDB = createConnectDB({
    uri: "mongodb://example.test/forever",
    connect: async (url, options) => {
      received = { url, options };
      return connection;
    },
  });

  await connectDB();

  assert.equal(received.url, "mongodb://example.test/forever");
  assert.equal(received.options.maxPoolSize, 5);
  assert.ok(received.options.serverSelectionTimeoutMS <= 5000);
});

test("registers the database pool only on Vercel", async (t) => {
  quietLogger(t);

  const attached = [];
  const makeConnectDB = (onVercel) =>
    createConnectDB({
      uri: "mongodb://example.test/forever",
      onVercel,
      connect: async () => connection,
      attachPool: (client) => attached.push(client),
    });

  await makeConnectDB(false)();
  assert.deepEqual(attached, []);

  await makeConnectDB(true)();
  assert.deepEqual(attached, [connection.getClient()]);
});

test("the real adapter registers the connection's own client", async (t) => {
  quietLogger(t);

  const client = { id: "real-client" };
  t.mock.method(mongoose, "connect", async () => mongoose);
  t.mock.method(mongoose.connection, "getClient", () => client);

  const attached = [];
  const connectDB = createConnectDB({
    uri: "mongodb://example.test/forever",
    onVercel: true,
    attachPool: (value) => attached.push(value),
  });

  await connectDB();

  assert.deepEqual(attached, [client]);
});
