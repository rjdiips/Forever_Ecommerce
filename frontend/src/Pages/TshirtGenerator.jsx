import React, { useState } from "react";
import TshirtCanvas from "../Components/TshirtCanvas";
import TshirtControls from "../Components/TshirtControls";
import { assets } from "../assets/assets";

const TshirtGeneratorPage = () => {
  const DEFAULT_POSITION = { x: 500, y: 500 }; // Adjust position of image
  const [tshirtColor, setTshirtColor] = useState("white");
  const [graphic, setGraphic] = useState(null); // Default to null preset
  const [scale, setScale] = useState(0.3);
  const [position, setPosition] = useState(DEFAULT_POSITION);

  return (
    <div className="border-t">
      <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* The Canvas */}
        <div className="md:col-span-2">
          <TshirtCanvas
            tshirtColor={tshirtColor}
            graphic={graphic}
            scale={scale}
            position={position}
            setPosition={setPosition}
          />
        </div>

        {/* The Controls */}
        <div className="md:col-span-1">
          <TshirtControls
            setTshirtColor={setTshirtColor}
            setGraphic={setGraphic}
            scale={scale}
            setScale={setScale}
            setPosition={setPosition}
            defaultPosition={DEFAULT_POSITION}
          />
        </div>
      </div>
    </div>
  );
};

export default TshirtGeneratorPage;
