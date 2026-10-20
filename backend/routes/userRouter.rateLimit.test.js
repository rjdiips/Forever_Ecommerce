import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { startAuthServer, stubUserModel } from "../test-support/authHttp.js";

/**
 * The auth rate limits, observed over the HTTP seam.
 *
 * Each test uses its own client IP because the limiters keep their counters in
 * memory for the life of this process. The `ip` option sends an
 * `x-forwarded-for` header that the app's one trusted proxy hop resolves.
 */

let auth;

before(async () => {
  auth = await startAuthServer();
});

after(async () => {
  await auth.close();
});

/** A failed login, which is enough to count against the limiter. */
const login = (ip) =>
  auth.request("/api/user/login", {
    method: "POST",
    body: { email: "nobody@example.com", password: "wrong-password" },
    ip,
  });

/** A failed sign-up, rejected on the password rule before any hashing. */
const register = (ip) =>
  auth.request("/api/user/register", {
    method: "POST",
    body: {
      name: "Test User",
      email: "nobody@example.com",
      password: "short",
    },
    ip,
  });

/** A failed admin sign-in, which is enough to count against the limiter. */
const adminLogin = (ip) =>
  auth.request("/api/user/admin", {
    method: "POST",
    body: { email: "admin@example.com", password: "wrong-password" },
    ip,
  });

/** A passed validation, which is enough to count against the limiter. */
const forgotPassword = (ip) =>
  auth.request("/api/user/forgot-password", {
    method: "POST",
    body: { email: "nobody@example.com" },
    ip,
  });

test("login allows ten attempts per client IP, then answers 429", async (t) => {
  stubUserModel(t, { findOne: async () => null });
  const ip = "203.0.113.10";

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const response = await login(ip);
    assert.equal(response.status, 400, `attempt ${attempt} should be allowed`);
  }

  const rejected = await login(ip);

  assert.equal(rejected.status, 429);
  assert.deepEqual(Object.keys(rejected.body).sort(), ["message", "success"]);
  assert.equal(rejected.body.success, false);
  assert.equal(typeof rejected.body.message, "string");
  assert.notEqual(rejected.body.message, "");
});

test("registration allows ten attempts per client IP, then answers 429", async (t) => {
  stubUserModel(t, { findOne: async () => null });
  const ip = "203.0.113.11";

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const response = await register(ip);
    assert.equal(response.status, 400, `attempt ${attempt} should be allowed`);
  }

  const rejected = await register(ip);

  assert.equal(rejected.status, 429);
  assert.equal(rejected.body.success, false);
  assert.equal(typeof rejected.body.message, "string");
  assert.notEqual(rejected.body.message, "");
});

test("admin sign-in allows five attempts per client IP, then answers 429", async () => {
  const ip = "203.0.113.12";

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await adminLogin(ip);
    assert.equal(response.status, 400, `attempt ${attempt} should be allowed`);
  }

  const rejected = await adminLogin(ip);

  assert.equal(rejected.status, 429);
  assert.equal(rejected.body.success, false);
  assert.equal(typeof rejected.body.message, "string");
  assert.notEqual(rejected.body.message, "");
});

test("forgot-password allows five attempts per client IP, then answers 429", async (t) => {
  stubUserModel(t, { findOne: async () => null });
  const ip = "203.0.113.13";

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await forgotPassword(ip);
    assert.equal(response.status, 200, `attempt ${attempt} should be allowed`);
  }

  const rejected = await forgotPassword(ip);

  assert.equal(rejected.status, 429);
  assert.equal(rejected.body.success, false);
  assert.equal(typeof rejected.body.message, "string");
  assert.notEqual(rejected.body.message, "");
});

test("a second client IP keeps its own login allowance", async (t) => {
  stubUserModel(t, { findOne: async () => null });

  for (let attempt = 1; attempt <= 11; attempt += 1) {
    await login("203.0.113.20");
  }

  const exhausted = await login("203.0.113.20");
  assert.equal(exhausted.status, 429);

  const otherClient = await login("203.0.113.21");
  assert.equal(otherClient.status, 400);
});
