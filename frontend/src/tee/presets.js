import { assets } from "../assets/assets";
import { DEFAULT_GRAPHIC_SCALE } from "./designReducer";

export const DEFAULT_CUSTOM_GRAPHIC_SCALE = 0.1;

export const PRESETS = [
  { id: "off-road", src: assets.preset1, defaultScale: DEFAULT_GRAPHIC_SCALE },
  { id: "yin-yang", src: assets.preset2, defaultScale: DEFAULT_GRAPHIC_SCALE },
  { id: "hustle", src: assets.preset3, defaultScale: DEFAULT_GRAPHIC_SCALE },
  { id: "portrait", src: assets.preset4, defaultScale: DEFAULT_GRAPHIC_SCALE },
  { id: "cat", src: assets.preset5, defaultScale: DEFAULT_GRAPHIC_SCALE },
];
