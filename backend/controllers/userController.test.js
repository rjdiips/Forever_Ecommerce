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
