import logo from "./logo.png";
import hero_img from "./hero_img.png";
import cart_icon from "./cart_icon.png";
import bin_icon from "./bin_icon.png";
import dropdown_icon from "./dropdown_icon.png";
import exchange_icon from "./exchange_icon.png";
import profile_icon from "./profile_icon.png";
import quality_icon from "./quality_icon.png";
import search_icon from "./search_icon.png";
import star_dull_icon from "./star_dull_icon.png";
import star_icon from "./star_icon.png";
import support_img from "./support_img.png";
import menu_icon from "./menu_icon.png";
import about_img from "./about_img.webp";
import contact_img from "./contact_img.webp";
import stripe_logo from "./stripe_logo.png";
import cross_icon from "./cross_icon.png";
import empty_cart from "./empty_cart.svg";

// Presets are canvas-sized WebP copies, plus tiny thumbnails for the picker.
// The originals are deliberately not imported: a 4096px PNG is decoded in full
// even when it is shown at 48px. See `frontend/src/tee/presets.test.js`.
import preset1 from "./presets/off-road-car-palm.webp";
import preset2 from "./presets/yin-yang.webp";
import preset3 from "./presets/hustle.webp";
import preset4 from "./presets/artistic-portrait.webp";
import preset5 from "./presets/cat-silhouette.webp";
import preset1Thumb from "./presets/thumbs/off-road-car-palm.webp";
import preset2Thumb from "./presets/thumbs/yin-yang.webp";
import preset3Thumb from "./presets/thumbs/hustle.webp";
import preset4Thumb from "./presets/thumbs/artistic-portrait.webp";
import preset5Thumb from "./presets/thumbs/cat-silhouette.webp";

export const assets = {
  logo,
  hero_img,
  cart_icon,
  dropdown_icon,
  exchange_icon,
  profile_icon,
  quality_icon,
  search_icon,
  star_dull_icon,
  star_icon,
  bin_icon,
  support_img,
  menu_icon,
  about_img,
  contact_img,
  stripe_logo,
  cross_icon,
  empty_cart,
  preset1,
  preset2,
  preset3,
  preset4,
  preset5,
  preset1Thumb,
  preset2Thumb,
  preset3Thumb,
  preset4Thumb,
  preset5Thumb,
};
