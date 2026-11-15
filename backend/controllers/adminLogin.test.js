import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import { startAuthServer } from "../test-support/authHttp.js";

process.env.JWT_SECRET = "admin-login-test-secret";

let auth;

before(async () => {
  auth = await startAuthServer();
});

after(async () => {
  await auth.close();
});

/** Run one admin sign-in with the deployment configuration a test needs. */
const adminLogin = async ({ env, body, ip }) => {
  const saved = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };

  const apply = () => {
    if (env.email === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = env.email;
    if (env.password === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = env.password;
  };

  apply();

  try {
    return await auth.request("/api/user/admin", { method: "POST", body, ip });
  } finally {
    if (saved.email === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = saved.email;
    if (saved.password === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = saved.password;
  }
};

test("an unconfigured deployment refuses admin sign-in instead of opening it", async () => {
  // The bug this pins: with both variables unset, an empty body used to match
  // them (`undefined !== undefined` is false) and received an admin token.
  for (const body of [{}, { email: undefined, password: undefined }, undefined]) {
    const response = await adminLogin({
      env: {},
      body,
      ip: "198.51.100.61",
    });

    assert.equal(response.status, 503, `body ${JSON.stringify(body)}`);
    assert.equal(response.body.success, false);
    assert.equal(response.body.data, undefined);
  }
});

test("a half-configured deployment also refuses admin sign-in", async () => {
  const response = await adminLogin({
    env: { email: "admin@example.com" },
    body: { email: "admin@example.com", password: "" },
    ip: "198.51.100.62",
  });

  assert.equal(response.status, 503);
});

test("wrong credentials are one generic 400 and mint nothing", async () => {
  const response = await adminLogin({
    env: { email: "admin@example.com", password: "a-long-random-password" },
    body: { email: "admin@example.com", password: "not-the-password" },
    ip: "198.51.100.63",
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, "Invalid email or password");
  assert.equal(response.body.data, undefined);
});

test("correct credentials mint an admin-session token with no credential inside", async () => {
  const env = { email: "admin@example.com", password: "a-long-random-password" };
  const response = await adminLogin({
    env,
    body: { email: env.email, password: env.password },
    ip: "198.51.100.64",
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);

  const claims = jwt.decode(response.body.data.token);
  assert.equal(claims.purpose, "admin-session");
  assert.equal(claims.role, "admin");
  assert.equal(JSON.stringify(claims).includes(env.password), false);
  assert.equal(JSON.stringify(claims).includes(env.email), false);
});
