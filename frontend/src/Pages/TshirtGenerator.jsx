import { useContext, useRef } from "react";
import { findCustomTee, formatMoney, toCents } from "@forever/shared";
import TshirtCanvas from "../Components/TshirtCanvas";
import TshirtControls from "../Components/TshirtControls";
import { ShopContext } from "../Context/ShopContext";
import { useTeeDesign } from "../tee/useTeeDesign";

const TshirtGeneratorPage = () => {
  const { design, selectGraphic, moveTo, setScale, setColor, reset } = useTeeDesign();
  const { allProducts } = useContext(ShopContext);
  const canvasRef = useRef(null);

  // The Custom Tee is a base Product: the generator designs onto it, so it is
  // found in the product list rather than hardcoded.
  const baseTee = findCustomTee(allProducts);

  return (
    <div className="border-t">
      <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* The Canvas */}
        <div className="md:col-span-2">
          <TshirtCanvas ref={canvasRef} design={design} onMove={moveTo} />
        </div>

        {/* The Controls */}
        <div className="md:col-span-1">
          {baseTee && (
            <p className="mb-3 text-sm text-gray-500">
              Designing onto {baseTee.name} · {formatMoney(toCents(baseTee.price))}
            </p>
          )}

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
