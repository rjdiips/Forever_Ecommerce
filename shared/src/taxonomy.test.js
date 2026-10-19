import test from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORIES,
  SUB_CATEGORIES,
  isCategory,
  isSubCategory,
} from "./taxonomy.js";

test("the taxonomy has one list of categories and one of sub-categories", () => {
  assert.deepEqual(CATEGORIES, ["Men", "Women", "Kids"]);
  assert.deepEqual(SUB_CATEGORIES, ["Topwear", "Bottomwear", "Winterwear"]);
});

test("a category is recognised only when it is in the list", () => {
  for (const value of CATEGORIES) {
    assert.equal(isCategory(value), true);
  }

  for (const value of ["men", "Shoes", "", null, undefined, 3]) {
    assert.equal(isCategory(value), false);
  }
});

test("a sub-category is recognised only when it is in the list", () => {
  for (const value of SUB_CATEGORIES) {
    assert.equal(isSubCategory(value), true);
  }

  for (const value of ["topwear", "Shoes", "", null, undefined, 3]) {
    assert.equal(isSubCategory(value), false);
  }
});
