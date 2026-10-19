import test from "node:test";
import assert from "node:assert/strict";
import {
  PRODUCT_KIND,
  catalogueProducts,
  findCustomTee,
  formatProductPrice,
  isCustomTee,
  normalizeProductKind,
} from "./product.js";

const standard = { _id: "1", name: "Hoodie" };
const base = { _id: "2", name: "Custom Tee", kind: "custom-tee" };
const explicitStandard = { _id: "3", name: "Cap", kind: "standard" };

test("exposes the two product kinds the shop and the API agree on", () => {
  assert.deepEqual(PRODUCT_KIND, {
    STANDARD: "standard",
    CUSTOM_TEE: "custom-tee",
  });
});

test("treats only the custom-tee kind as the base", () => {
  assert.equal(isCustomTee(base), true);
  assert.equal(isCustomTee(explicitStandard), false);
  assert.equal(isCustomTee(standard), false);
  assert.equal(isCustomTee(null), false);
  assert.equal(isCustomTee(undefined), false);
});

test("coerces an unknown kind to an ordinary product", () => {
  assert.equal(
    normalizeProductKind(PRODUCT_KIND.CUSTOM_TEE),
    PRODUCT_KIND.CUSTOM_TEE
  );
  assert.equal(
    normalizeProductKind(PRODUCT_KIND.STANDARD),
    PRODUCT_KIND.STANDARD
  );
  assert.equal(normalizeProductKind("banana"), PRODUCT_KIND.STANDARD);
  assert.equal(normalizeProductKind(undefined), PRODUCT_KIND.STANDARD);
});

test("keeps a product with no kind as an ordinary catalogue product", () => {
  assert.deepEqual(catalogueProducts([standard, base, explicitStandard]), [
    standard,
    explicitStandard,
  ]);
});

test("finds the custom-tee base however it is ordered", () => {
  assert.equal(findCustomTee([standard, base]), base);
  assert.equal(findCustomTee([base, standard]), base);
});

test("returns null when the catalogue holds no base", () => {
  assert.equal(findCustomTee([standard, explicitStandard]), null);
  assert.equal(findCustomTee([]), null);
  assert.equal(findCustomTee(), null);
});

test("formats a whole-dollar product price with the shared currency", () => {
  assert.equal(formatProductPrice(10), "$10.00");
});

test("formats a product price that includes cents", () => {
  assert.equal(formatProductPrice(19.99), "$19.99");
  assert.equal(formatProductPrice(0.05), "$0.05");
});

test("formats a product price in an explicit currency", () => {
  assert.equal(formatProductPrice(19.99, "EUR"), "€19.99");
});
