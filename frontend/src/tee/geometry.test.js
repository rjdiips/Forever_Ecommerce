import { describe, expect, it } from "vitest";
import { bounds, hitTest, toCanvasPoint } from "./geometry";

describe("bounds", () => {
  it("centres the scaled graphic on its position", () => {
    expect(
      bounds({
        position: { x: 500, y: 500 },
        scale: 0.5,
        graphicSize: { width: 200, height: 100 },
      })
    ).toEqual({ x: 450, y: 475, width: 100, height: 50 });
  });

  it("collapses to the position until the graphic size is known", () => {
    expect(
      bounds({ position: { x: 300, y: 400 }, scale: 0.5, graphicSize: null })
    ).toEqual({ x: 300, y: 400, width: 0, height: 0 });
  });
});

describe("hitTest", () => {
  const box = { x: 100, y: 100, width: 200, height: 100 };

  it("accepts points inside and on the edge", () => {
    expect(hitTest({ x: 100, y: 100 }, box)).toBe(true);
    expect(hitTest({ x: 300, y: 200 }, box)).toBe(true);
    expect(hitTest({ x: 200, y: 150 }, box)).toBe(true);
  });

  it("rejects points outside", () => {
    expect(hitTest({ x: 99, y: 150 }, box)).toBe(false);
    expect(hitTest({ x: 200, y: 201 }, box)).toBe(false);
  });
});

describe("toCanvasPoint", () => {
  it("maps a CSS-pixel pointer into canvas space", () => {
    const rect = { left: 50, top: 20, width: 500, height: 500 };
    expect(toCanvasPoint({ clientX: 300, clientY: 270 }, rect)).toEqual({
      x: 500,
      y: 500,
    });
  });

  it("honours a non-uniform rect scale", () => {
    const rect = { left: 0, top: 0, width: 250, height: 500 };
    expect(toCanvasPoint({ clientX: 125, clientY: 250 }, rect)).toEqual({
      x: 500,
      y: 500,
    });
  });
});
