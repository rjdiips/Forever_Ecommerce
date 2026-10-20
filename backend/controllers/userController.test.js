import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { startAuthServer, stubUserModel } from "../test-support/authHttp.js";

process.env.JWT_SECRET = "ticket-02-test-secret";

const SEVEN_DAYS = 7 * 24 * 60 * 60;

let auth;

before(async () => {
  auth = await startAuthServer();
});

after(async () => {
  await auth.close();
});

test("a successful login mints a versioned 7-day Session token", async (t) => {
  const password = "correct-horse";
  const user = {
    _id: new mongoose.Types.ObjectId(),
    email: "ada@example.com",
    password: bcrypt.hashSync(password, 4),
    tokenVersion: 5,
  };

  stubUserModel(t, { findOne: async () => user });

  const response = await auth.request("/api/user/login", {
    method: "POST",
    body: { email: user.email, password },
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);

  const claims = jwt.decode(response.body.data.token);
  assert.equal(claims.userId, String(user._id));
  assert.equal(claims.tokenVersion, 5);
  assert.equal(claims.purpose, "session");
  assert.equal(claims.exp - claims.iat, SEVEN_DAYS);
});

test("an unknown email and a wrong password fail identically", async (t) => {
  const user = {
    _id: new mongoose.Types.ObjectId(),
    email: "ada@example.com",
    password: bcrypt.hashSync("correct-horse", 4),
    tokenVersion: 0,
  };

  stubUserModel(t, {
    findOne: async ({ email }) => (email === user.email ? user : null),
  });

  const unknownEmail = await auth.request("/api/user/login", {
    method: "POST",
    body: { email: "nobody@example.com", password: "wrong-password" },
    ip: "198.51.100.31",
  });
  const wrongPassword = await auth.request("/api/user/login", {
    method: "POST",
    body: { email: user.email, password: "wrong-password" },
    ip: "198.51.100.31",
  });

  // A failed login is a bad credential, not an expired Session: both are 400
  // so the client never mistakes one for the other.
  assert.equal(unknownEmail.status, 400);
  assert.equal(wrongPassword.status, 400);
  assert.notEqual(unknownEmail.status, 401);

  // Same body, byte for byte: the message must not reveal which field was wrong.
  assert.deepEqual(unknownEmail.body, wrongPassword.body);
  assert.equal(wrongPassword.body.message, "Invalid email or password");
});

/** Median of a list of numbers, so one scheduling hiccup cannot decide a timing test. */
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

/** Time one login over HTTP, in milliseconds. */
const timeLogin = async (body, ip) => {
  const started = performance.now();
  await auth.request("/api/user/login", { method: "POST", body, ip });
  return performance.now() - started;
};

test("an unknown email still pays for a password comparison", async (t) => {
  const user = {
    _id: new mongoose.Types.ObjectId(),
    email: "ada@example.com",
    // Cost 10, the same as the API's dummy hash, so the two paths are comparable.
    password: bcrypt.hashSync("correct-horse", 10),
    tokenVersion: 0,
  };

  stubUserModel(t, {
    findOne: async ({ email }) => (email === user.email ? user : null),
  });

  const ip = "198.51.100.32";
  const unknown = [];
  const wrong = [];

  // Warm the connection and the process so the first request is not an outlier.
  await timeLogin({ email: "nobody@example.com", password: "wrong" }, ip);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    unknown.push(
      await timeLogin(
        { email: "nobody@example.com", password: "wrong" },
        ip
      )
    );
    wrong.push(
      await timeLogin({ email: user.email, password: "wrong" }, ip)
    );
  }

  // Without a dummy comparison the unknown-email path is nearly instant, so
  // this ratio captures the timing leak that the status/body test cannot.
  assert.ok(
    median(unknown) >= median(wrong) * 0.4,
    `unknown email took ${median(unknown)}ms, wrong password ${median(wrong)}ms`
  );
});

test("registration mints a versioned 7-day Session token", async (t) => {
  stubUserModel(t, {
    findOne: async () => null,
    save: async function () {
      return this;
    },
  });

  const response = await auth.request("/api/user/register", {
    method: "POST",
    body: {
      name: "Ada",
      email: "ada@example.com",
      password: "correct-horse",
    },
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.message, "User created successfully");

  const claims = jwt.decode(response.body.data.token);
  assert.equal(claims.userId, response.body.data.user._id);
  assert.equal(claims.tokenVersion, 0);
  assert.equal(claims.purpose, "session");
  assert.equal(claims.exp - claims.iat, SEVEN_DAYS);
});
