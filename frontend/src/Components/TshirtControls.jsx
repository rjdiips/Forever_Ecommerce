import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./Button";
import InlineNotice from "./InlineNotice";
import { DEFAULT_CUSTOM_GRAPHIC_SCALE, PRESETS } from "../tee/presets";
import { downscaleGraphicFile } from "../tee/upload";

const Legend = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#111]">
    {children}
  </p>
);

const Group = ({ children }) => (
  <section className="mt-5 border-t border-gray-200 pt-5">{children}</section>
);

const TshirtControls = ({
  design,
  colors = [],
  onSelectGraphic,
  onScale,
  onColor,
  onReset,
}) => {
  // The editor owns the object URL of an uploaded graphic so it can be revoked
  // when the draft moves on. Presets are bundled URLs and are never revoked.
  const uploadUrlRef = useRef(null);
  const uploadRequestRef = useRef(0);
  // A rejected file belongs to the upload control (ADR-0008).
  const [uploadError, setUploadError] = useState("");

  const releaseUploadUrl = useCallback(() => {
    if (uploadUrlRef.current) {
      URL.revokeObjectURL(uploadUrlRef.current);
      uploadUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => releaseUploadUrl();
  }, [releaseUploadUrl]);

  const selectGraphic = (src, scale) => {
    // A pending downscale must not install a graphic after the shopper has
    // already chosen a preset or removed the graphic.
    uploadRequestRef.current += 1;
    releaseUploadUrl();
    onSelectGraphic(src, scale);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const request = uploadRequestRef.current + 1;
    uploadRequestRef.current = request;
    setUploadError("");

    try {
      const url = await downscaleGraphicFile(file);
      if (request !== uploadRequestRef.current) {
        URL.revokeObjectURL(url);
        return;
      }

      releaseUploadUrl();
      uploadUrlRef.current = url;
      onSelectGraphic(url, DEFAULT_CUSTOM_GRAPHIC_SCALE);
    } catch (error) {
      setUploadError(
        error?.message || "That image couldn't be used. Try a PNG or JPG."
      );
    } finally {
      // Let the same file be chosen again after a failed attempt.
      event.target.value = "";
    }
  };

  const handleReset = () => {
    uploadRequestRef.current += 1;
    releaseUploadUrl();
    onReset();
  };

  return (
    <div className="border border-[#111] bg-white p-5 shadow-[7px_7px_0_rgba(17,17,17,0.06)]">
      <p className="text-[9px] uppercase tracking-[0.3em] text-[#a85580]">
        Forever / The design
      </p>

      {/* --- T-shirt Colour --- */}
      <div className="mt-5">
        <Legend>The blank</Legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onColor(color)}
              aria-pressed={design.color === color}
              className={`h-11 min-w-12 border px-3 text-[11px] capitalize tracking-[0.14em] transition-colors ${
                design.color === color
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-[#111]"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* --- Preset Graphics --- */}
      <Group>
        <div className="flex items-baseline justify-between gap-4">
          <Legend>Graphic</Legend>
          <button
            type="button"
            onClick={() => selectGraphic(null)}
            className="border-b border-current pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-[#8f4a56]"
          >
            Remove
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => selectGraphic(preset.src, preset.defaultScale)}
              aria-pressed={design.graphic === preset.src}
              aria-label={`Use the ${preset.id} graphic`}
              className={`h-14 w-14 border bg-white p-1.5 transition-colors ${
                design.graphic === preset.src
                  ? "border-[#111]"
                  : "border-gray-300 hover:border-gray-500"
              }`}
            >
              <img
                src={preset.thumb}
                alt=""
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      </Group>

      {/* --- Custom File Upload --- */}
      <Group>
        <Legend>Your own image</Legend>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          aria-label="Upload your own image"
          className="mt-3 block w-full text-[11px] text-gray-500 file:mr-3 file:border file:border-[#111] file:bg-white file:px-3 file:py-2 file:text-[9px] file:font-semibold file:uppercase file:tracking-[0.2em] file:text-[#111] file:transition-colors hover:file:bg-[#111] hover:file:text-white"
        />

        {uploadError ? (
          <InlineNotice className="mt-2">{uploadError}</InlineNotice>
        ) : null}
      </Group>

      <Group>
        <div className="flex items-baseline justify-between gap-4">
          <Legend>Graphic size</Legend>
          <p className="text-[9px] uppercase tracking-[0.18em] text-gray-400 tabular-nums">
            {Math.round(design.scale * 100)}%
          </p>
        </div>
        <input
          type="range"
          min="0.001"
          max="1.0"
          step="0.001"
          value={design.scale}
          onChange={(event) => onScale(parseFloat(event.target.value))}
          aria-label="Graphic size"
          className="mt-4 h-px w-full cursor-pointer appearance-none bg-gray-300 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:bg-[#111] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-[#111]"
        />
      </Group>

      <Button variant="outline" onClick={handleReset} className="mt-6 w-full">
        Reset the design
      </Button>
    </div>
  );
};

export default TshirtControls;
