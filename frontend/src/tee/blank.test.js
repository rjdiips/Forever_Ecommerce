import { describe, expect, it } from "vitest";
import { teeBlankUrl } from "./blank";

const cloudinary =
  "https://res.cloudinary.com/demo/image/upload/v1699999999/tee.png";

describe("teeBlankUrl", () => {
  it("asks Cloudinary for a square, auto-formatted blank", () => {
    expect(teeBlankUrl(cloudinary)).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1200,h_1200,c_fill/v1699999999/tee.png"
    );
  });

  it("leaves an image that Cloudinary does not serve alone", () => {
    expect(teeBlankUrl("https://example.com/tee.png")).toBe(
      "https://example.com/tee.png"
    );
    expect(teeBlankUrl("/assets/tee.png")).toBe("/assets/tee.png");
  });

  it("has no URL when the base supplies no image", () => {
    expect(teeBlankUrl(undefined)).toBeNull();
    expect(teeBlankUrl(null)).toBeNull();
    expect(teeBlankUrl("")).toBeNull();
    expect(teeBlankUrl(42)).toBeNull();
  });
});
