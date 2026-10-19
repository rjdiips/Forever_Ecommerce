import { describe, expect, it } from "vitest";
import { cropRect, isWithinBudget, teeBoundingBox } from "./export";

function imageData(width, height, opaque = []) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (const [x, y] of opaque) data[(y * width + x) * 4 + 3] = 255;
  return { data, width, height };
}

describe("teeBoundingBox", () => {
  it("returns null for a blank image", () => {
    expect(teeBoundingBox(imageData(4, 4))).toBeNull();
  });

  it("wraps the opaque pixels", () => {
    expect(teeBoundingBox(imageData(4, 4, [[1, 1], [2, 3]]))).toEqual({
      x: 1,
      y: 1,
      width: 2,
      height: 3,
    });
  });

  it("ignores pixels at or below the alpha threshold", () => {
    const image = imageData(3, 3);
    image.data[(1 * 3 + 1) * 4 + 3] = 5;
    expect(teeBoundingBox(image, 8)).toBeNull();
  });
});

describe("cropRect", () => {
  it("adds a 2% margin around the box", () => {
    expect(cropRect({ x: 100, y: 100, width: 400, height: 500 }, 1000, 0.02)).toEqual({
      x: 80,
      y: 80,
      width: 440,
      height: 540,
    });
  });

  it("falls back to the whole canvas when there is no box", () => {
    expect(cropRect(null, 1000, 0.02)).toEqual({ x: 0, y: 0, width: 1000, height: 1000 });
  });

  it("clamps to the canvas and never returns an empty rect", () => {
    expect(cropRect({ x: -50, y: 990, width: 100, height: 100 }, 1000, 0.02)).toEqual({
      x: 0,
      y: 970,
      width: 70,
      height: 30,
    });
    expect(cropRect({ x: 0, y: 0, width: 1, height: 1 }, 1000, 0)).toEqual({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });
  });
});

describe("isWithinBudget", () => {
  it("compares against the byte budget", () => {
    expect(isWithinBudget({ size: 500 * 1024 }, 500 * 1024)).toBe(true);
    expect(isWithinBudget({ size: 500 * 1024 + 1 }, 500 * 1024)).toBe(false);
    expect(isWithinBudget(null)).toBe(false);
  });
});
