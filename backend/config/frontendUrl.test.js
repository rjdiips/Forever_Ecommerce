import test from "node:test";
import assert from "node:assert/strict";

import { getFrontendUrl, requireFrontendUrl } from "./frontendUrl.js";

const withFrontendUrl = (value, run) => {
  const original = process.env.FRONTEND_URL;

  if (value === undefined) {
    delete process.env.FRONTEND_URL;
  } else {
    process.env.FRONTEND_URL = value;
  }

  try {
    return run();
  } finally {
    if (original === undefined) {
      delete process.env.FRONTEND_URL;
    } else {
      process.env.FRONTEND_URL = original;
    }
  }
};

test("the storefront origin is required and named in the error", () => {
  for (const value of [undefined, null, "", "   "]) {
    assert.throws(
      () => requireFrontendUrl(value),
      /FRONTEND_URL is required/,
      `expected ${JSON.stringify(value)} to be rejected`
    );
  }
});

test("the storefront origin is trimmed and loses trailing slashes", () => {
  assert.equal(
    requireFrontendUrl(" https://shop.example.com/ "),
    "https://shop.example.com"
  );
  assert.equal(
    requireFrontendUrl("http://localhost:5173///"),
    "http://localhost:5173"
  );
});

test("the configured origin is read from FRONTEND_URL", () => {
  assert.equal(
    withFrontendUrl(" https://shop.example.com/ ", getFrontendUrl),
    "https://shop.example.com"
  );
});

test("reading a missing FRONTEND_URL fails loudly", () => {
  assert.throws(
    () => withFrontendUrl(undefined, getFrontendUrl),
    /FRONTEND_URL is required/
  );
});
