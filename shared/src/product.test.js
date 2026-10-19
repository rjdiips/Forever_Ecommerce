import test from "node:test";
import assert from "node:assert/strict";
import {
  PRODUCT_KIND,
  TEE_COLORS,
  catalogueProducts,
  findCustomTee,
  formatProductPrice,
  isCustomTee,
  normalizeProductKind,
  normalizeTeeColor,
  orderProducts,
  teeBases,
  findTeeBase,
  teeColors,
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

test("exposes the colours a Tee base can be", () => {
  assert.deepEqual(TEE_COLORS, ["white", "black"]);
});

test("coerces a colour to the vocabulary, or to no colour", () => {
  assert.equal(normalizeTeeColor("white"), "white");
  assert.equal(normalizeTeeColor("black"), "black");

  for (const color of ["green", "WHITE", "", null, undefined, 42, {}]) {
    assert.equal(normalizeTeeColor(color), null);
  }
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

const whiteBase = {
  _id: "4",
  name: "White Tee",
  kind: "custom-tee",
  color: "white",
  position: 1,
};
const blackBase = {
  _id: "5",
  name: "Black Tee",
  kind: "custom-tee",
  color: "black",
  position: 2,
};

test("lists every Tee base in catalogue display order", () => {
  assert.deepEqual(teeBases([blackBase, standard, whiteBase]), [
    whiteBase,
    blackBase,
  ]);
  assert.deepEqual(teeBases([base]), [base]);
  assert.deepEqual(teeBases([standard, explicitStandard]), []);
  assert.deepEqual(teeBases([]), []);
  assert.deepEqual(teeBases(), []);
});

test("finds the Tee base for a colour however it is ordered", () => {
  assert.equal(findTeeBase([blackBase, whiteBase], "white"), whiteBase);
  assert.equal(findTeeBase([whiteBase, blackBase], "black"), blackBase);
});

test("finds no base for a colour the catalogue does not offer", () => {
  assert.equal(findTeeBase([whiteBase], "black"), null);
  assert.equal(findTeeBase([whiteBase, blackBase], "green"), null);
  assert.equal(findTeeBase([], "white"), null);
  assert.equal(findTeeBase(), null);
});

test("a colourless base matches no colour", () => {
  assert.equal(findTeeBase([base], "white"), null);
  assert.equal(findTeeBase([base]), null);
});

test("lists the colours the catalogue actually offers", () => {
  assert.deepEqual(teeColors([blackBase, whiteBase]), ["white", "black"]);
  assert.deepEqual(teeColors([whiteBase]), ["white"]);
  assert.deepEqual(teeColors([blackBase]), ["black"]);
  assert.deepEqual(teeColors([whiteBase, whiteBase]), ["white"]);
});

test("offers no colour for a colourless base or an empty catalogue", () => {
  assert.deepEqual(teeColors([base]), []);
  assert.deepEqual(teeColors([standard, explicitStandard]), []);
  assert.deepEqual(teeColors([]), []);
  assert.deepEqual(teeColors(), []);
});

test("does not offer a colour no base supplies", () => {
  const greyBase = { ...blackBase, _id: "9", name: "Grey Tee", color: "grey" };
  assert.deepEqual(teeColors([greyBase, whiteBase]), ["white"]);
});

test("a Tee base saved before colours existed reads back with no colour", () => {
  assert.equal(base.color, undefined);
  assert.deepEqual(teeBases([base]), [base]);
  assert.deepEqual(teeColors([base]), []);
  assert.equal(findTeeBase([base], "white"), null);
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
