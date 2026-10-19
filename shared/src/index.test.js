import test from "node:test";
import assert from "node:assert/strict";
import { CURRENCY, DELIVERY_FEE, formatMoney, fromCents, toCents } from "@forever/shared";
import { addCartLine, cartLines, cartLineId, setCartLineQuantity } from "@forever/shared";

test("the package root exposes money and delivery", () => {
  assert.equal(typeof toCents, "function");
  assert.equal(typeof fromCents, "function");
  assert.equal(typeof formatMoney, "function");
  assert.equal(typeof CURRENCY, "string");
  assert.equal(typeof DELIVERY_FEE, "number");
});

test("the package root exposes the Cart line helpers the shop and API share", () => {
  assert.equal(typeof addCartLine, "function");
  assert.equal(typeof cartLines, "function");
  assert.equal(typeof cartLineId, "function");
  assert.equal(typeof setCartLineQuantity, "function");
});
