import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_KIND } from "@forever/shared";
import { resolveProductColor } from "./product.js";
import { HttpError } from "./http.js";

test("a Tee base stores a colour from the shared vocabulary", () => {
  assert.equal(resolveProductColor(PRODUCT_KIND.CUSTOM_TEE, "white"), "white");
  assert.equal(resolveProductColor(PRODUCT_KIND.CUSTOM_TEE, "black"), "black");
});

test("a Tee base without a valid colour is refused", () => {
  for (const color of [undefined, null, "", "green", "WHITE", 42, {}]) {
    assert.throws(
      () => resolveProductColor(PRODUCT_KIND.CUSTOM_TEE, color),
      (err) => err instanceof HttpError && err.status === 400
    );
  }
});

test("an ordinary product never stores a colour", () => {
  assert.equal(resolveProductColor(PRODUCT_KIND.STANDARD, "black"), null);
  assert.equal(resolveProductColor(undefined, "black"), null);
  assert.equal(resolveProductColor("banana", "white"), null);
});

test("an untrusted colour on an ordinary product is no colour", () => {
  assert.equal(resolveProductColor(PRODUCT_KIND.STANDARD, "green"), null);
  assert.equal(resolveProductColor(undefined, undefined), null);
});
