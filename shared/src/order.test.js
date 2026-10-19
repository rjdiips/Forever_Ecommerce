import test from "node:test";
import assert from "node:assert/strict";
import {
  ORDER_PRICING,
  orderAmountCents,
  orderItemPriceCents,
} from "./order.js";

test("an order written before server pricing is read as major units", () => {
  const order = { amount: 19.99 };

  assert.equal(orderAmountCents(order), 1999);
  assert.equal(orderItemPriceCents({ price: 19.99 }, order), 1999);
});

test("an order written with server pricing is already cents", () => {
  const order = { amount: 1999, pricingVersion: ORDER_PRICING.CENTS };

  assert.equal(orderAmountCents(order), 1999);
  assert.equal(orderItemPriceCents({ price: 1999 }, order), 1999);
});

test("a missing amount or price reads as zero", () => {
  assert.equal(orderAmountCents(null), 0);
  assert.equal(orderAmountCents({}), 0);
  assert.equal(orderItemPriceCents(undefined, {}), 0);
});
