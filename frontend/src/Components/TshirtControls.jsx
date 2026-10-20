import { useCallback, useEffect, useRef } from "react";
import { toast } from "../toast/toast";
import { DEFAULT_CUSTOM_GRAPHIC_SCALE, PRESETS } from "../tee/presets";
import { designFileName } from "../tee/purchase";
import { downscaleGraphicFile } from "../tee/upload";

const TshirtControls = ({
  design,
  colors = [],
  onSelectGraphic,
  onScale,
  onColor,
  onReset,
  onExport,
  canExport = true,
}) => {
  // The editor owns the object URL of an uploaded graphic so it can be revoked
  // when the draft moves on. Presets are bundled URLs and are never revoked.
  const uploadUrlRef = useRef(null);
  const uploadRequestRef = useRef(0);

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
      toast.error(error?.message || "Could not use that image.");
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

  const handleDownload = async () => {
    try {
      const blob = await onExport();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = designFileName(blob.type);
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.message || "Could not export the design.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 border rounded-lg shadow-lg">
      {/* --- T-shirt Color --- */}
      <div>
        <h3 className="text-lg font-semibold mb-2">T-shirt Color</h3>
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onColor(color)}
              className={`p-2 !border rounded capitalize hover:bg-gray-100 ${
                design.color === color ? "bg-gray-200 font-semibold" : ""
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* --- Preset Graphics --- */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Preset Graphics</h3>
        <div className="flex gap-2 items-center flex-wrap">
          {PRESETS.map((preset) => (
            <img
              key={preset.id}
              src={preset.thumb}
              alt={preset.id}
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              onClick={() => selectGraphic(preset.src, preset.defaultScale)}
              className={`w-12 h-12 !border cursor-pointer object-contain p-1 ${
                design.graphic === preset.src ? "ring-2 ring-black" : ""
              }`}
            />
          ))}
          <button
            onClick={() => selectGraphic(null)}
            className="h-12 p-2 text-sm !border rounded text-red-500 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      </div>

      {/* --- Custom File Upload --- */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Your Own</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="
            block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:!border
            file:text-sm file:font-semibold
            file:bg-white file:text-gray-700
            hover:file:bg-gray-100
          "
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-1">Graphic Size</h3>
        <input
          type="range"
          min="0.001"
          max="1.0"
          step="0.001"
          value={design.scale}
          onChange={(event) => onScale(parseFloat(event.target.value))}
          className="
            w-full
            h-1
            bg-gray-300
            rounded-lg
            appearance-none
            cursor-pointer
            
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:bg-black
            [&::-webkit-slider-thumb]:rounded-sm
            
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:bg-black
            [&::-moz-range-thumb]:rounded-sm
          "
        />
      </div>

      {/* --- Download + Reset --- */}
      <button
        onClick={handleDownload}
        disabled={!canExport}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Download Design
      </button>
      <button
        onClick={handleReset}
        className="w-full py-2 text-sm !border rounded hover:bg-gray-100"
      >
        Reset
      </button>
    </div>
  );
};

export default TshirtControls;
