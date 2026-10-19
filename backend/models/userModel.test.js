import test from "node:test";
import assert from "node:assert/strict";

import UserModel from "./userModel.js";

const user = (overrides = {}) => ({
  name: "Ada",
  email: "ada@example.com",
  password: "hashed",
  ...overrides,
});

test("a new User starts at token version 0", () => {
  assert.equal(new UserModel(user()).tokenVersion, 0);
});

test("a User's token version can be bumped", () => {
  const existing = new UserModel(user({ tokenVersion: 3 }));

  existing.tokenVersion += 1;

  assert.equal(existing.tokenVersion, 4);
});
