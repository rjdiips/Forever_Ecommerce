import { useRef } from "react";
import TshirtCanvas from "../Components/TshirtCanvas";
import TshirtControls from "../Components/TshirtControls";
import { useTeeDesign } from "../tee/useTeeDesign";

const TshirtGeneratorPage = () => {
  const { design, selectGraphic, moveTo, setScale, setColor, reset } = useTeeDesign();
  const canvasRef = useRef(null);

  return (
    <div className="border-t">
      <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* The Canvas */}
        <div className="md:col-span-2">
          <TshirtCanvas ref={canvasRef} design={design} onMove={moveTo} />
        </div>

        {/* The Controls */}
        <div className="md:col-span-1">
          <TshirtControls
            design={design}
            onSelectGraphic={selectGraphic}
            onScale={setScale}
            onColor={setColor}
            onReset={reset}
            onExport={() => canvasRef.current?.exportBlob()}
          />
        </div>
      </div>
    </div>
  );
};

export default TshirtGeneratorPage;
