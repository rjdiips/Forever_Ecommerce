import { DEFAULT_POSITION } from "./geometry";

export const TEE_COLORS = ["white", "black"];

export const DEFAULT_GRAPHIC_SCALE = 0.2;

export const INITIAL_DESIGN = {
  color: "white",
  graphic: null,
  graphicSize: null,
  scale: DEFAULT_GRAPHIC_SCALE,
  position: DEFAULT_POSITION,
};

// Pure reducer behind useTeeDesign(). Intent names match the hook's API:
// selectGraphic / moveTo / setScale / setColor / reset (graphicLoaded is
// internal bookkeeping for the graphic's natural size).
export function designReducer(state, action) {
  switch (action.type) {
    case "selectGraphic": {
      if (!action.src) {
        return { ...state, graphic: null, graphicSize: null };
      }
      return {
        ...state,
        graphic: action.src,
        graphicSize: null,
        scale: action.defaultScale ?? state.scale,
        position: DEFAULT_POSITION,
      };
    }
    case "graphicLoaded":
      return { ...state, graphicSize: action.size };
    case "moveTo":
      return { ...state, position: action.position };
    case "setScale":
      return { ...state, scale: action.scale };
    case "setColor":
      return { ...state, color: action.color };
    case "reset":
      return { ...INITIAL_DESIGN };
    default:
      return state;
  }
}
