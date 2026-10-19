import test from "node:test";
import assert from "node:assert/strict";
import {
  PRODUCT_KIND,
  catalogueProducts,
  findCustomTee,
  formatProductPrice,
  isCustomTee,
  normalizeProductKind,
  orderProducts,
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

const early = { _id: "a", name: "Early", position: 1, date: 10 };
const later = { _id: "b", name: "Later", position: 2, date: 5 };
const legacy = { _id: "c", name: "Legacy", date: 1 };
const added = { _id: "d", name: "Added", position: 1760000000000, date: 200 };

test("orders products by their admin-set position", () => {
  assert.deepEqual(orderProducts([later, early]), [early, later]);
});

test("keeps products saved before ordering existed ahead of positioned ones", () => {
  assert.deepEqual(orderProducts([early, legacy]), [legacy, early]);
});

test("puts a newly added product at the end of the catalogue", () => {
  assert.deepEqual(orderProducts([added, later, early]), [
    early,
    later,
    added,
  ]);
});

test("breaks a position tie by the date added, then by id", () => {
  const newerTie = { _id: "b", date: 2 };
  const olderTie = { _id: "a", date: 2 };
  const oldest = { _id: "c", date: 1 };

  assert.deepEqual(orderProducts([newerTie, olderTie, oldest]), [
    oldest,
    olderTie,
    newerTie,
  ]);
});

test("does not mutate the products it is given", () => {
  const input = [later, early];
  orderProducts(input);
  assert.deepEqual(input, [later, early]);
});

test("returns an empty list when there are no products", () => {
  assert.deepEqual(orderProducts([]), []);
  assert.deepEqual(orderProducts(), []);
});
