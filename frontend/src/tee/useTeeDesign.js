import { useCallback, useEffect, useReducer } from "react";
import { designReducer, INITIAL_DESIGN } from "./designReducer";

// Owns the tee draft and exposes the editor's intents. The state transitions
// and the geometry it relies on live in designReducer.js / geometry.js, both
// of which are pure and tested directly.
export function useTeeDesign() {
  const [design, dispatch] = useReducer(designReducer, INITIAL_DESIGN);

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
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  return { design, selectGraphic, moveTo, setScale, setColor, reset };
}
