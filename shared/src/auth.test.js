import test from "node:test";
import assert from "node:assert/strict";

import {
  GENERIC_PASSWORD_RESET_CONFIRMATION,
  MIN_PASSWORD_LENGTH,
  passwordTooShortMessage,
} from "./index.js";

test("the shared password minimum is the same on every surface", () => {
  assert.equal(MIN_PASSWORD_LENGTH, 6);
});

test("the shared password message names the minimum", () => {
  assert.equal(
    passwordTooShortMessage(),
    "Password should be at least 6 characters",
  );
});

test("the shared reset confirmation does not reveal whether an account exists", () => {
  assert.match(GENERIC_PASSWORD_RESET_CONFIRMATION, /if an account/i);
  assert.match(GENERIC_PASSWORD_RESET_CONFIRMATION, /reset link has been sent/i);
});
