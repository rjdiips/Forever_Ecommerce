import test from "node:test";
import assert from "node:assert/strict";
import { CURRENCY, DELIVERY_FEE, formatMoney, fromCents, toCents } from "@forever/shared";

test("the package root exposes money and delivery", () => {
  assert.equal(typeof toCents, "function");
  assert.equal(typeof fromCents, "function");
  assert.equal(typeof formatMoney, "function");
  assert.equal(typeof CURRENCY, "string");
  assert.equal(typeof DELIVERY_FEE, "number");
});
