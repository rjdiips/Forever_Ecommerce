import { describe, expect, it } from "vitest";
import { INITIAL_DESIGN, designReducer } from "./designReducer";

describe("designReducer", () => {
  it("selects a graphic, recentres it and applies the preset scale", () => {
    const state = designReducer(INITIAL_DESIGN, {
      type: "selectGraphic",
      src: "a.png",
      defaultScale: 0.4,
    });
    expect(state.graphic).toBe("a.png");
    expect(state.scale).toBe(0.4);
    expect(state.position).toEqual(INITIAL_DESIGN.position);
    expect(state.graphicSize).toBeNull();
  });

  it("clears the graphic when the source is empty", () => {
    const state = designReducer(
      { ...INITIAL_DESIGN, graphic: "a.png", graphicSize: { width: 10, height: 10 } },
      { type: "selectGraphic", src: null }
    );
    expect(state.graphic).toBeNull();
    expect(state.graphicSize).toBeNull();
  });

  it("records the loaded graphic size", () => {
    const state = designReducer(INITIAL_DESIGN, {
      type: "graphicLoaded",
      size: { width: 10, height: 20 },
    });
    expect(state.graphicSize).toEqual({ width: 10, height: 20 });
  });

  it("moves, scales and recolours without disturbing the rest", () => {
    const moved = designReducer(INITIAL_DESIGN, {
      type: "moveTo",
      position: { x: 1, y: 2 },
    });
    expect(moved.position).toEqual({ x: 1, y: 2 });
    expect(moved.scale).toBe(INITIAL_DESIGN.scale);
    expect(designReducer(INITIAL_DESIGN, { type: "setScale", scale: 0.7 }).scale).toBe(0.7);
    expect(designReducer(INITIAL_DESIGN, { type: "setColor", color: "black" }).color).toBe(
      "black"
    );
  });

  it("starts with no colour until the catalogue resolves", () => {
    expect(INITIAL_DESIGN.color).toBeNull();
  });

  it("takes the first available colour once the bases arrive", () => {
    const state = designReducer(
      { ...INITIAL_DESIGN, color: null },
      { type: "availableColors", colors: ["black", "white"] }
    );
    expect(state.color).toBe("black");
  });

  it("keeps the current colour while its base is still offered", () => {
    const state = designReducer(
      { ...INITIAL_DESIGN, color: "black" },
      { type: "availableColors", colors: ["white", "black"] }
    );
    expect(state.color).toBe("black");
  });

  it("moves to an available colour when the current one's base disappears", () => {
    const state = designReducer(
      { ...INITIAL_DESIGN, color: "white" },
      { type: "availableColors", colors: ["black"] }
    );
    expect(state.color).toBe("black");
  });

  it("leaves the colour unknown while no bases are available", () => {
    const state = designReducer(
      { ...INITIAL_DESIGN, color: "white" },
      { type: "availableColors", colors: [] }
    );
    expect(state.color).toBeNull();
  });

  it("returns the same state when the colour is already chosen", () => {
    const settled = { ...INITIAL_DESIGN, color: "white" };
    expect(
      designReducer(settled, {
        type: "availableColors",
        colors: ["white", "black"],
      })
    ).toBe(settled);
  });

  it("resets to the initial design", () => {
    const dirty = {
      color: "black",
      graphic: "a.png",
      graphicSize: { width: 1, height: 1 },
      scale: 0.9,
      position: { x: 1, y: 1 },
    };
    expect(designReducer(dirty, { type: "reset" })).toEqual(INITIAL_DESIGN);
  });

  it("returns the same state for unknown actions", () => {
    expect(designReducer(INITIAL_DESIGN, { type: "nope" })).toBe(INITIAL_DESIGN);
  });
});
