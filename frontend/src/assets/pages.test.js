import { describe, expect, it } from "vitest";
import { statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// About and Contact used to ship ~1 MB PNGs each, far heavier than the
// 450-480px they are rendered at. Keeping them as downscaled WebP is what
// keeps these pages light; this budget stops a replacement from regressing it.
const ASSET_DIR = fileURLToPath(new URL(".", import.meta.url));

const MAX_PAGE_IMAGE_BYTES = 150 * 1024;

const PAGE_IMAGES = ["about_img.webp", "contact_img.webp"];

describe("page images", () => {
  it.each(PAGE_IMAGES)("ships %s within budget", (name) => {
    const { size } = statSync(join(ASSET_DIR, name));

    expect(size, `${name} is ${size} bytes`).toBeLessThanOrEqual(
      MAX_PAGE_IMAGE_BYTES
    );
  });
});
