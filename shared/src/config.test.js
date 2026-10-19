import test from "node:test";
import assert from "node:assert/strict";
import { requireApiBaseUrl } from "./config.js";

test("returns a configured API base URL", () => {
  assert.equal(
    requireApiBaseUrl("https://api.forever.example"),
    "https://api.forever.example",
  );
});

test("trims whitespace around the configured URL", () => {
  assert.equal(
    requireApiBaseUrl("  http://localhost:4000  "),
    "http://localhost:4000",
  );
});

test("rejects a missing value", () => {
  assert.throws(
    () => requireApiBaseUrl(undefined),
    /VITE_BACKEND_URL is required/,
  );
});

test("rejects a blank value", () => {
  assert.throws(() => requireApiBaseUrl(""), /VITE_BACKEND_URL is required/);
});

test("rejects a whitespace-only value", () => {
  assert.throws(
    () => requireApiBaseUrl(" \t\n "),
    /VITE_BACKEND_URL is required/,
  );
});
