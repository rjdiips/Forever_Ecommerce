import test from "node:test";
import assert from "node:assert/strict";
import {
  ORDER_PRICING,
  ORDER_STATUS,
  ORDER_STATUSES,
  isOrderStatus,
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

test("the order statuses have one ordered definition", () => {
  assert.deepEqual(ORDER_STATUSES, [
    "Order Placed",
    "Packing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ]);
  assert.equal(ORDER_STATUS.PLACED, "Order Placed");
  assert.equal(ORDER_STATUS.DELIVERED, "Delivered");
});

test("only a known order status is accepted", () => {
  for (const status of ORDER_STATUSES) {
    assert.equal(isOrderStatus(status), true);
  }

  for (const status of ["Packed", "order placed", "", null, undefined, 3]) {
    assert.equal(isOrderStatus(status), false);
  }
});
