import { describe, expect, it } from "vitest";
import { scaledSize } from "./upload";

describe("scaledSize", () => {
  it("fits the longest edge inside the limit and keeps the aspect ratio", () => {
    expect(scaledSize(4000, 3000, 1000)).toEqual({ width: 1000, height: 750 });
    expect(scaledSize(3000, 4000, 1000)).toEqual({ width: 750, height: 1000 });
  });

  it("never scales a graphic up", () => {
    expect(scaledSize(800, 600, 1000)).toEqual({ width: 800, height: 600 });
    expect(scaledSize(1000, 1000, 1000)).toEqual({ width: 1000, height: 1000 });
  });

  it("rounds to whole pixels and keeps at least one", () => {
    expect(scaledSize(3000, 1, 1000)).toEqual({ width: 1000, height: 1 });
  });

  it("returns null when the source has no usable size", () => {
    for (const [width, height] of [
      [0, 100],
      [100, 0],
      [-1, 100],
      [Number.NaN, 100],
      [Number.POSITIVE_INFINITY, 100],
    ]) {
      expect(scaledSize(width, height, 1000)).toBeNull();
    }
  });
});
