import { DEFAULT_POSITION } from "./geometry";

export const DEFAULT_GRAPHIC_SCALE = 0.2;

// The draft starts with no colour: the editor does not know which Tee bases the
// catalogue offers until it has loaded, so the colour is taken from the
// catalogue rather than guessed here (see `availableColors`).
export const INITIAL_DESIGN = {
  color: null,
  graphic: null,
  graphicSize: null,
  scale: DEFAULT_GRAPHIC_SCALE,
  position: DEFAULT_POSITION,
};

// Pure reducer behind useTeeDesign(). Intent names match the hook's API:
// selectGraphic / moveTo / setScale / setColor / reset (graphicLoaded is
// internal bookkeeping for the graphic's natural size, and availableColors is
// the catalogue's Tee colours arriving or changing).
export function designReducer(state, action) {
  switch (action.type) {
    // Reconcile the draft's colour with the colours the catalogue offers: keep
    // it while its base is still there, otherwise take the first available
    // one, or none when the catalogue offers no base at all. Returns the same
    // state when nothing changes, so the hook can dispatch this on every
    // catalogue update without looping.
    case "availableColors": {
      const colors = action.colors ?? [];
      const next = colors.includes(state.color) ? state.color : colors[0] ?? null;
      return next === state.color ? state : { ...state, color: next };
    }
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
