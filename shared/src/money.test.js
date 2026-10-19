import test from "node:test";
import assert from "node:assert/strict";
import { CURRENCY, formatMoney, fromCents, toCents } from "./money.js";

test("converts an amount in major units to integer cents", () => {
  assert.equal(toCents(10), 1000);
  assert.equal(toCents(19.99), 1999);
  assert.equal(toCents(0), 0);
});

test("rounds to the nearest cent and drops the float error", () => {
  assert.equal(toCents(0.1 + 0.2), 30);
  assert.equal(toCents(19.999), 2000);
  assert.ok(Number.isInteger(toCents(19.99)));
});

test("converts integer cents back to major units", () => {
  assert.equal(fromCents(1000), 10);
  assert.equal(fromCents(1999), 19.99);
  assert.equal(fromCents(0), 0);
});

test("survives a round trip through cents", () => {
  for (const amount of [0, 0.01, 10, 19.99, 1234.56]) {
    assert.equal(fromCents(toCents(amount)), amount);
  }
});

test("formats integer cents as a currency amount", () => {
  assert.equal(formatMoney(1000), "$10.00");
  assert.equal(formatMoney(1999), "$19.99");
  assert.equal(formatMoney(0), "$0.00");
  assert.equal(formatMoney(5), "$0.05");
});

test("formats other currencies by their ISO code", () => {
  assert.equal(formatMoney(1999, "EUR"), "€19.99");
  assert.equal(formatMoney(1999, "GBP"), "£19.99");
});

test("defaults to the shared currency", () => {
  assert.equal(formatMoney(1000, CURRENCY), formatMoney(1000));
  assert.equal(CURRENCY, "USD");
});
