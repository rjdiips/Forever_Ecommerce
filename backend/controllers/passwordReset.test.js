import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { startAuthServer, stubUserModel } from "../test-support/authHttp.js";
import { emailService } from "../lib/email.js";
import { log } from "../lib/log.js";

process.env.JWT_SECRET = "ticket-07-test-secret";
process.env.FRONTEND_URL = "https://shop.example.test/";

const GENERIC_MINUTES = 30;

let auth;

before(async () => {
  auth = await startAuthServer();
});

after(async () => {
  await auth.close();
});

const makeUser = () => ({
  _id: new mongoose.Types.ObjectId(),
  email: "ada@example.com",
  tokenVersion: 7,
});

const requestReset = (email, ip) =>
  auth.request("/api/user/forgot-password", {
    method: "POST",
    body: { email },
    ip,
  });

test("a known and an unknown email get the same generic confirmation", async (t) => {
  const user = makeUser();

  stubUserModel(t, {
    findOne: async ({ email }) => (email === user.email ? user : null),
  });
  const send = t.mock.method(
    emailService,
    "sendPasswordResetEmail",
    async () => {}
  );

  const known = await requestReset(user.email, "198.51.100.61");
  const unknown = await requestReset("nobody@example.com", "198.51.100.61");

  assert.equal(known.status, 200);
  assert.equal(unknown.status, 200);
  assert.equal(known.body.success, true);
  assert.equal(unknown.body.success, true);
  assert.deepEqual(known.body, unknown.body);
  assert.equal(send.mock.callCount(), 1);
});

test("a known account is emailed a 30-minute Password reset link", async (t) => {
  const user = makeUser();

  stubUserModel(t, {
    findOne: async ({ email }) => (email === user.email ? user : null),
  });
  const send = t.mock.method(
    emailService,
    "sendPasswordResetEmail",
    async () => {}
  );

  const response = await requestReset(user.email, "198.51.100.62");

  assert.equal(response.status, 200);
  assert.equal(send.mock.callCount(), 1);

  const [{ to, resetUrl }] = send.mock.calls[0].arguments;
  assert.equal(to, user.email);

  const link = new URL(resetUrl);
  assert.equal(link.origin, "https://shop.example.test");
  assert.equal(link.pathname, "/reset-password");

  const token = link.searchParams.get("token");
  assert.equal(typeof token, "string");
  assert.notEqual(token, "");

  const claims = jwt.decode(token);
  assert.equal(claims.userId, String(user._id));
  assert.equal(claims.tokenVersion, 7);
  assert.equal(claims.purpose, "password-reset");
  assert.equal(claims.exp - claims.iat, GENERIC_MINUTES * 60);
});

test("a missing or malformed email is a 400 and sends nothing", async (t) => {
  const send = t.mock.method(
    emailService,
    "sendPasswordResetEmail",
    async () => {}
  );
  const { findOne } = stubUserModel(t, { findOne: async () => null });

  const response = await requestReset(undefined, "198.51.100.63");
  const malformed = await requestReset("not-an-email", "198.51.100.63");

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(malformed.status, 400);
  assert.equal(malformed.body.success, false);
  assert.equal(findOne.mock.callCount(), 0);
  assert.equal(send.mock.callCount(), 0);
});

test("an email failure is logged and the response stays generic", async (t) => {
  const user = makeUser();

  stubUserModel(t, {
    findOne: async ({ email }) => (email === user.email ? user : null),
  });
  t.mock.method(emailService, "sendPasswordResetEmail", async () => {
    throw new Error("provider is down");
  });
  const logged = t.mock.method(log, "error", () => {});

  const known = await requestReset(user.email, "198.51.100.64");
  const unknown = await requestReset("nobody@example.com", "198.51.100.64");

  assert.equal(known.status, 200);
  assert.equal(unknown.status, 200);
  assert.deepEqual(known.body, unknown.body);
  assert.equal(logged.mock.callCount(), 1);
  assert.match(logged.mock.calls[0].arguments[0], /password reset/i);
});
