import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { once } from "node:events";

import { designUploadRateLimit, subscribeRateLimit } from "./rateLimit.js";
import { errorHandler } from "../lib/http.js";

/**
 * The resource-facing limiters: the newsletter route (per client IP) and the
 * design upload route (per signed-in User).
 *
 * Each limiter keeps its fixed window in memory, so this file uses its own
 * client addresses and user ids.
 */

const HOST = "127.0.0.1";

let server;
let baseUrl;

before(async () => {
  const app = express();
  app.set("trust proxy", 1);

  // Stand-ins for the real handlers, so the limiter is the only thing under
  // test. `designUploadRateLimit` is mounted after authentication in
  // production, so the probe sets the same `req.userId` that `userAuth` sets.
  app.post("/subscribe", subscribeRateLimit, (req, res) => {
    res.json({ ok: true });
  });
  app.post(
    "/upload",
    (req, res, next) => {
      req.userId = req.headers["x-user-id"] ?? "user-a";
      next();
    },
    designUploadRateLimit,
    (req, res) => {
      res.json({ ok: true });
    }
  );
  app.use(errorHandler);

  server = app.listen(0, HOST);
  await once(server, "listening");
  baseUrl = `http://${HOST}:${server.address().port}`;
});

after(() => {
  if (server?.listening) {
    server.closeAllConnections();
    server.close();
  }
});

/** POST once; `ip` goes through the one trusted proxy hop. */
const post = async (path, { ip, userId } = {}) => {
  const headers = { connection: "close" };
  if (ip) headers["x-forwarded-for"] = ip;
  if (userId) headers["x-user-id"] = userId;

  const response = await fetch(new URL(path, baseUrl), {
    method: "POST",
    headers,
  });

  return { status: response.status, body: await response.json().catch(() => ({})) };
};

test("the newsletter route allows five sends per client IP, then answers 429", async () => {
  const ip = "203.0.113.201";

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await post("/subscribe", { ip });
    assert.equal(response.status, 200, `attempt ${attempt} should be allowed`);
  }

  const rejected = await post("/subscribe", { ip });
  assert.equal(rejected.status, 429);
  assert.equal(rejected.body.success, false);

  const otherClient = await post("/subscribe", { ip: "203.0.113.202" });
  assert.equal(otherClient.status, 200);
});

test("design uploads allow ten per signed-in User, then answer 429", async () => {
  const userId = "user-rate-limited";

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const response = await post("/upload", { userId });
    assert.equal(response.status, 200, `attempt ${attempt} should be allowed`);
  }

  const rejected = await post("/upload", { userId });
  assert.equal(rejected.status, 429);
  assert.equal(rejected.body.success, false);

  // The bound follows the account, not the connection.
  const otherUser = await post("/upload", { userId: "user-with-allowance" });
  assert.equal(otherUser.status, 200);
});
