import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import { startAuthServer, stubUserModel } from "../test-support/authHttp.js";
import { route } from "../lib/http.js";
import {
  TOKEN_PURPOSE,
  signPasswordResetToken,
  signSessionToken,
} from "../lib/authTokens.js";
import { userAuth } from "./userAuth.js";

const SECRET = "ticket-02-test-secret";
process.env.JWT_SECRET = SECRET;

const USER_ID = "507f1f77bcf86cd799439011";

const user = (overrides = {}) => ({
  _id: USER_ID,
  tokenVersion: 3,
  ...overrides,
});

let auth;

before(async () => {
  auth = await startAuthServer({
    // A probe route, mounted before the shared error handler, so the real
    // `userAuth` middleware and the real failure envelope are exercised over
    // HTTP without inventing a production endpoint.
    mount: (app) => {
      app.get(
        "/api/session/probe",
        userAuth,
        route((req) => ({ userId: req.userId }))
      );
    },
  });
});

after(async () => {
  await auth.close();
});

const requestWithToken = (token) =>
  auth.request("/api/session/probe", {
    headers: token === undefined ? {} : { token },
  });

test("a current Session token authenticates the request", async (t) => {
  stubUserModel(t, { findById: async () => user() });

  const response = await requestWithToken(signSessionToken(USER_ID, 3));

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.data, { userId: USER_ID });
});

test("a missing Session token is refused", async () => {
  const response = await requestWithToken();

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("an expired Session token reports expiry distinctly", async (t) => {
  stubUserModel(t, { findById: async () => user() });

  const expired = jwt.sign(
    { userId: USER_ID, tokenVersion: 3, purpose: TOKEN_PURPOSE.SESSION },
    SECRET,
    { expiresIn: -10 }
  );
  const response = await requestWithToken(expired);

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Session expired, please log in again");
});

test("a Session token whose version is stale is refused", async (t) => {
  stubUserModel(t, { findById: async () => user({ tokenVersion: 4 }) });

  const response = await requestWithToken(signSessionToken(USER_ID, 3));

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.notEqual(response.body.message, "Session expired, please log in again");
});

test("a Session token for a User that no longer exists is refused", async (t) => {
  stubUserModel(t, { findById: async () => null });

  const response = await requestWithToken(signSessionToken(USER_ID, 3));

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("a Password reset token cannot authenticate a request", async (t) => {
  stubUserModel(t, { findById: async () => user() });

  const response = await requestWithToken(
    signPasswordResetToken(USER_ID, 3)
  );

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.notEqual(response.body.message, "Session expired, please log in again");
});

test("a tampered Session token is refused", async (t) => {
  stubUserModel(t, { findById: async () => user() });

  const token = signSessionToken(USER_ID, 3);
  const response = await requestWithToken(`${token}x`);

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.notEqual(response.body.message, "Session expired, please log in again");
});
