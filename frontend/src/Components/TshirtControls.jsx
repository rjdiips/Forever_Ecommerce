import React from "react";
import { assets } from "../assets/assets";

// Default scales for different graphic types
const DEFAULT_PRESET_SCALE = 0.2;
const DEFAULT_CUSTOM_GRAPHIC_SCALE = 0.1; // A smaller default for unknown image sizes

const TshirtControls = ({ setTshirtColor, setGraphic, scale, setScale }) => {
  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "custom-tshirt.png";
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 border rounded-lg shadow-lg">
      {/* --- T-shirt Color --- */}
      <div>
        <h3 className="text-lg font-semibold mb-2">T-shirt Color</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTshirtColor("white")}
            className="p-2 !border rounded hover:bg-gray-100"
          >
            White
          </button>
          <button
            onClick={() => setTshirtColor("black")}
            className="p-2 !border rounded hover:bg-gray-100"
          >
            Black
          </button>
        </div>
      </div>

      {/* --- Preset Graphics --- */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Preset Graphics</h3>
        <div className="flex gap-2 items-center flex-wrap">
          <img
            src={assets.preset1}
            onClick={() => {
              setGraphic(assets.preset1);
              setScale(DEFAULT_PRESET_SCALE);
            }}
            className="w-12 h-12 !border cursor-pointer object-contain p-1"
          />
          <img
            src={assets.preset2}
            onClick={() => {
              setGraphic(assets.preset2);
              setScale(DEFAULT_PRESET_SCALE);
            }}
            className="w-12 h-12 !border cursor-pointer object-contain p-1"
          />
          <img
            src={assets.preset3}
            onClick={() => {
              setGraphic(assets.preset3);
              setScale(DEFAULT_PRESET_SCALE);
            }}
            className="w-12 h-12 !border cursor-pointer object-contain p-1"
          />
          <img
            src={assets.preset4}
            onClick={() => {
              setGraphic(assets.preset4);
              setScale(DEFAULT_PRESET_SCALE);
            }}
            className="w-12 h-12 !border cursor-pointer object-contain p-1"
          />
          <img
            src={assets.preset5}
            onClick={() => {
              setGraphic(assets.preset5);
              setScale(DEFAULT_PRESET_SCALE);
            }}
            className="w-12 h-12 !border cursor-pointer object-contain p-1"
          />
          <button
            onClick={() => setGraphic(null)}
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
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const fileUrl = URL.createObjectURL(e.target.files[0]);
              setGraphic(fileUrl);
              setScale(DEFAULT_CUSTOM_GRAPHIC_SCALE);
            }
          }}
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
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
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

      {/* --- Download Button --- */}
      <button
        onClick={handleDownload}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Download Design
      </button>
    </div>
  );
};

export default TshirtControls;
