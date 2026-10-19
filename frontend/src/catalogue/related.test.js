import { describe, expect, it } from "vitest";
import { RELATED_LIMIT, relatedTo } from "./related";

const product = {
  _id: "tee",
  category: "Men",
  subCategory: "Topwear",
};

const catalogue = [
  product,
  { _id: "p1", category: "Men", subCategory: "Topwear" },
  { _id: "p2", category: "Men", subCategory: "Topwear" },
  { _id: "p3", category: "Men", subCategory: "Bottomwear" },
  { _id: "p4", category: "Women", subCategory: "Topwear" },
  { _id: "p5", category: "Men", subCategory: "Topwear" },
  { _id: "p6", category: "Men", subCategory: "Topwear" },
  { _id: "p7", category: "Men", subCategory: "Topwear" },
];

describe("relatedTo", () => {
  it("keeps only products with the same category and sub-category", () => {
    expect(relatedTo(catalogue, product).map((item) => item._id)).toEqual([
      "p1",
      "p2",
      "p5",
      "p6",
      "p7",
    ]);
  });

  it("excludes the product itself", () => {
    expect(relatedTo(catalogue, product)).not.toContainEqual(product);
  });

  it("caps the result at the default limit", () => {
    expect(relatedTo(catalogue, product)).toHaveLength(RELATED_LIMIT);
  });

  it("honours a smaller limit and drops nothing else", () => {
    expect(relatedTo(catalogue, product, 2).map((item) => item._id)).toEqual([
      "p1",
      "p2",
    ]);
    expect(relatedTo(catalogue, product, 0)).toEqual([]);
  });

  it("has nothing to relate without a product or catalogue", () => {
    expect(relatedTo(catalogue, null)).toEqual([]);
    expect(relatedTo([], product)).toEqual([]);
  });
});
