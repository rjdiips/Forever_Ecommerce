import { describe, expect, it } from "vitest";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// The picker used to download full-resolution PNGs, including a 15 MB
// 4096x4096 portrait, just to render 48x48 thumbnails. These budgets keep a
// future replacement asset from quietly undoing that.
const PRESET_DIR = fileURLToPath(new URL("../assets/presets", import.meta.url));
const THUMB_DIR = fileURLToPath(new URL("../assets/presets/thumbs", import.meta.url));

const MAX_PRESET_BYTES = 500 * 1024;
const MAX_THUMB_BYTES = 12 * 1024;

function webpFiles(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".webp"))
    .map((name) => ({
      name,
      bytes: statSync(join(dir, name)).size,
    }));
}

describe("preset assets", () => {
  it("ships five canvas-sized graphics within budget", () => {
    const files = webpFiles(PRESET_DIR);
    expect(files).toHaveLength(5);

    for (const file of files) {
      expect(file.bytes, `${file.name} is ${file.bytes} bytes`).toBeLessThanOrEqual(
        MAX_PRESET_BYTES
      );
    }
  });

  it("ships a matching thumbnail for every preset", () => {
    const presets = webpFiles(PRESET_DIR).map(({ name }) => name);
    const thumbs = webpFiles(THUMB_DIR);

    expect(thumbs.map(({ name }) => name).sort()).toEqual(presets.sort());

    for (const file of thumbs) {
      expect(file.bytes, `${file.name} is ${file.bytes} bytes`).toBeLessThanOrEqual(
        MAX_THUMB_BYTES
      );
    }
  });
});
