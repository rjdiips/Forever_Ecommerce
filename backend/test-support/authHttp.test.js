import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { startAuthServer, stubUserModel } from "./authHttp.js";

let auth;

before(async () => {
  auth = await startAuthServer();
});

after(async () => {
  await auth.close();
});

test("the auth HTTP seam trusts one proxy hop, as the deployed API does", () => {
  assert.equal(auth.app.get("trust proxy"), 1);
});

test("a failed login answers in the standard failure envelope", async (t) => {
  stubUserModel(t, {
    findOne: async () => null,
  });

  const response = await auth.request("/api/user/login", {
    method: "POST",
    body: { email: "nobody@example.com", password: "not-a-password" },
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(typeof response.body.message, "string");
  assert.notEqual(response.body.message, "");
});
