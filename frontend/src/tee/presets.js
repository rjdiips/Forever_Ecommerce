import { assets } from "../assets/assets";
import { DEFAULT_GRAPHIC_SCALE } from "./designReducer";

export const DEFAULT_CUSTOM_GRAPHIC_SCALE = 0.1;

// `src` is the canvas-sized graphic the editor draws; `thumb` is the 96px copy
// the picker shows. They must stay separate: rendering the full graphic at
// 48x48 makes the browser download and decode a canvas-sized image just to
// populate the picker.
export const PRESETS = [
  {
    id: "off-road",
    src: assets.preset1,
    thumb: assets.preset1Thumb,
    defaultScale: DEFAULT_GRAPHIC_SCALE,
  },
  {
    id: "yin-yang",
    src: assets.preset2,
    thumb: assets.preset2Thumb,
    defaultScale: DEFAULT_GRAPHIC_SCALE,
  },
  {
    id: "hustle",
    src: assets.preset3,
    thumb: assets.preset3Thumb,
    defaultScale: DEFAULT_GRAPHIC_SCALE,
  },
  {
    id: "portrait",
    src: assets.preset4,
    thumb: assets.preset4Thumb,
    defaultScale: DEFAULT_GRAPHIC_SCALE,
  },
  {
    id: "cat",
    src: assets.preset5,
    thumb: assets.preset5Thumb,
    defaultScale: DEFAULT_GRAPHIC_SCALE,
  },
];
