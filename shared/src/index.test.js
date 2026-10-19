import test from "node:test";
import assert from "node:assert/strict";
import { CURRENCY, DELIVERY_FEE, formatMoney, fromCents, toCents } from "@forever/shared";
import { addCartLine, cartLines, cartLineId, setCartLineQuantity } from "@forever/shared";
import { CATEGORIES, SUB_CATEGORIES, isCategory, isSubCategory } from "@forever/shared";
import { ORDER_STATUSES, isOrderStatus } from "@forever/shared";
import { formatProductPrice } from "@forever/shared";
import {
  TEE_COLORS,
  findTeeBase,
  normalizeTeeColor,
  teeBases,
  teeColors,
} from "@forever/shared";
import { requireApiBaseUrl } from "@forever/shared";

test("the package root exposes the API base URL validator", () => {
  assert.equal(typeof requireApiBaseUrl, "function");
});

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

test("the package root exposes the Product taxonomy", () => {
  assert.ok(Array.isArray(CATEGORIES));
  assert.ok(Array.isArray(SUB_CATEGORIES));
  assert.equal(typeof isCategory, "function");
  assert.equal(typeof isSubCategory, "function");
});

test("the package root exposes the order statuses", () => {
  assert.ok(Array.isArray(ORDER_STATUSES));
  assert.equal(typeof isOrderStatus, "function");
});

test("the package root exposes the Product price display", () => {
  assert.equal(typeof formatProductPrice, "function");
});

test("the package root exposes the Tee base lookups", () => {
  assert.ok(Array.isArray(TEE_COLORS));
  assert.equal(typeof normalizeTeeColor, "function");
  assert.equal(typeof teeBases, "function");
  assert.equal(typeof findTeeBase, "function");
  assert.equal(typeof teeColors, "function");
});
