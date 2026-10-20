import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import { startAuthServer } from "../test-support/authHttp.js";
import { route } from "../lib/http.js";
import {
  TOKEN_PURPOSE,
  signAdminSessionToken,
  signPasswordResetToken,
  signSessionToken,
} from "../lib/authTokens.js";
import { adminAuth } from "./adminAuth.js";

const SECRET = "ticket-04-test-secret";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin-test-password";

process.env.JWT_SECRET = SECRET;
process.env.ADMIN_EMAIL = ADMIN_EMAIL;
process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;

const TWELVE_HOURS = 12 * 60 * 60;

const EXPIRED_MESSAGE = "Admin session expired, please log in again";
const INVALID_MESSAGE = "Not authorized, token failed";
const NOT_AUTHORIZED_MESSAGE = "Not authorized, Login Again";

let auth;

before(async () => {
  auth = await startAuthServer({
    // A probe route, mounted before the shared error handler, so the real
    // `adminAuth` middleware and the real failure envelope are exercised over
    // HTTP without inventing a production endpoint.
    mount: (app) => {
      app.get("/api/admin/probe", adminAuth, route(() => ({ ok: true })));
    },
  });
});

after(async () => {
  await auth.close();
});

const adminLogin = (body, ip) =>
  auth.request("/api/user/admin", { method: "POST", body, ip });

const probe = (token) =>
  auth.request("/api/admin/probe", {
    headers: token === undefined ? {} : { token },
  });

test("admin sign-in mints a 12-hour token that carries no credentials", async () => {
  const response = await adminLogin(
    { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    "198.51.100.61"
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);

  const claims = jwt.decode(response.body.data.token);

  assert.equal(claims.role, "admin");
  assert.equal(claims.purpose, TOKEN_PURPOSE.ADMIN_SESSION);
  assert.equal(claims.exp - claims.iat, TWELVE_HOURS);
  assert.equal("email" in claims, false);
  assert.equal("password" in claims, false);
  assert.equal(response.text.includes(ADMIN_EMAIL), false);
  assert.equal(response.text.includes(ADMIN_PASSWORD), false);
});

test("admin sign-in still refuses bad credentials", async () => {
  const response = await adminLogin(
    { email: ADMIN_EMAIL, password: "wrong-password" },
    "198.51.100.62"
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Invalid email or password");
  assert.equal("token" in (response.body.data ?? {}), false);
});

test("a current admin Session token authenticates the admin API", async () => {
  const response = await probe(signAdminSessionToken());

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.data, { ok: true });
});

test("an expired admin Session token reports expiry distinctly", async () => {
  const expired = jwt.sign(
    { role: "admin", purpose: TOKEN_PURPOSE.ADMIN_SESSION },
    SECRET,
    { expiresIn: -10 }
  );
  const response = await probe(expired);

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, EXPIRED_MESSAGE);
});

test("a non-admin token cannot authenticate as an admin", async () => {
  const nonAdminTokens = [
    signSessionToken("507f1f77bcf86cd799439011", 0),
    signPasswordResetToken("507f1f77bcf86cd799439011", 0),
  ];

  for (const token of nonAdminTokens) {
    const response = await probe(token);

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(response.body.message, INVALID_MESSAGE);
    assert.notEqual(response.body.message, EXPIRED_MESSAGE);
  }
});

test("a token with the wrong role cannot authenticate as an admin", async () => {
  const wrongRole = jwt.sign(
    { role: "customer", purpose: TOKEN_PURPOSE.ADMIN_SESSION },
    SECRET,
    { expiresIn: TWELVE_HOURS }
  );
  const response = await probe(wrongRole);

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, INVALID_MESSAGE);
  assert.notEqual(response.body.message, EXPIRED_MESSAGE);
});

test("a legacy string admin token is refused", async () => {
  // The old admin token was the bare email + password, with no role, purpose or
  // expiry. It must not survive this change.
  const legacy = jwt.sign(ADMIN_EMAIL + ADMIN_PASSWORD, SECRET);
  const response = await probe(legacy);

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, INVALID_MESSAGE);
});

test("a tampered admin Session token reports failure, not expiry", async () => {
  const response = await probe(`${signAdminSessionToken()}x`);

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, INVALID_MESSAGE);
  assert.notEqual(response.body.message, EXPIRED_MESSAGE);
});

test("a missing admin token is refused", async () => {
  const response = await probe();

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, NOT_AUTHORIZED_MESSAGE);
});
