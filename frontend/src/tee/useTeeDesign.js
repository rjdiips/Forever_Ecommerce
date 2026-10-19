import { useCallback, useEffect, useReducer } from "react";
import { designReducer, INITIAL_DESIGN } from "./designReducer";

// Owns the tee draft and exposes the editor's intents. The state transitions
// and the geometry it relies on live in designReducer.js / geometry.js, both
// of which are pure and tested directly.
//
// `colors` is the Tee colours the catalogue offers, in catalogue display order.
// The caller memoises the list, so its identity is stable between renders and
// the draft is reconsidered only when the colours actually change. The draft
// takes the first one once the catalogue resolves, and follows the catalogue if
// that colour's base later disappears; it is never a hardcoded guess. The
// reducer returns the same state when the colour is unchanged, so dispatching
// on every identity change cannot loop, and resetting re-applies the colours
// the catalogue still offers.

// A stable empty list, so the default argument does not change the effect's
// dependency on every render.
const NO_COLORS = [];

export function useTeeDesign(colors = NO_COLORS) {
  const [design, dispatch] = useReducer(designReducer, INITIAL_DESIGN);

  useEffect(() => {
    dispatch({ type: "availableColors", colors });
  }, [colors]);

  // Learn the graphic's natural size so the layout can be computed in canvas
  // space (drawing, hit-testing and export all share bounds()).
  useEffect(() => {
    if (!design.graphic) return undefined;
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      dispatch({
        type: "graphicLoaded",
        size: { width: image.naturalWidth, height: image.naturalHeight },
      });
    };
    image.src = design.graphic;
    return () => {
      cancelled = true;
    };
  }, [design.graphic]);

  const selectGraphic = useCallback(
    (src, defaultScale) => dispatch({ type: "selectGraphic", src, defaultScale }),
    []
  );
  const moveTo = useCallback((position) => dispatch({ type: "moveTo", position }), []);
  const setScale = useCallback((scale) => dispatch({ type: "setScale", scale }), []);
  const setColor = useCallback((color) => dispatch({ type: "setColor", color }), []);
  const reset = useCallback(() => {
    dispatch({ type: "reset" });
    dispatch({ type: "availableColors", colors });
  }, [colors]);

  return { design, selectGraphic, moveTo, setScale, setColor, reset };
}
