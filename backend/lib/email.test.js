import test from "node:test";
import assert from "node:assert/strict";

import { buildPasswordResetEmail } from "./email.js";

const resetUrl = "https://shop.example.com/reset-password?token=abc123";

test("the reset email carries the reset link and states the 30-minute lifetime", () => {
  const email = buildPasswordResetEmail({ resetUrl });

  assert.match(email.subject, /password/i);
  assert.ok(email.text.includes(resetUrl));
  assert.ok(email.html.includes(resetUrl));
  assert.match(email.text, /30 minutes/);
  assert.match(email.html, /30 minutes/);
});
