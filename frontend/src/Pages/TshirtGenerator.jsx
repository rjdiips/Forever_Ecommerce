import { useContext, useRef, useState } from "react";
import { findCustomTee, formatMoney, toCents } from "@forever/shared";
import { toast } from "react-toastify";
import TshirtCanvas from "../Components/TshirtCanvas";
import TshirtControls from "../Components/TshirtControls";
import TeePurchase from "../Components/TeePurchase";
import { ShopContext } from "../Context/ShopContext";
import { useCatalogue } from "../catalogue/CatalogueContext";
import { useCart } from "../cart/CartContext";
import { useTeeDesign } from "../tee/useTeeDesign";
import {
  DEFAULT_PURCHASE_QUANTITY,
  canBuyCustomTee,
  purchaseQuantity,
  uploadDesign,
} from "../tee/purchase";

const TshirtGeneratorPage = () => {
  const { design, selectGraphic, moveTo, setScale, setColor, reset } = useTeeDesign();
  const { backendUrl, token, navigate } = useContext(ShopContext);
  const { allProducts } = useCatalogue();
  const { add } = useCart();
  const canvasRef = useRef(null);

  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(DEFAULT_PURCHASE_QUANTITY);
  const [busy, setBusy] = useState(false);

  // The Custom Tee is a base Product: the generator designs onto it, so it is
  // found in the product list rather than hardcoded.
  const baseTee = findCustomTee(allProducts);
  const sizes = baseTee?.sizes ?? [];
  const canBuy = Boolean(baseTee) && canBuyCustomTee({
    hasGraphic: Boolean(design.graphic),
    size,
  });

  // Export the finished Tee draft, store the design, then add the base Product
  // to the Cart as a line carrying that design (ADR-0001).
  const handleAddToCart = async () => {
    if (!baseTee) {
      toast.error("The Custom Tee is not available right now");
      return;
    }

    if (!token) {
      toast.error("Please sign in to save your custom tee");
      navigate("/login");
      return;
    }

    if (!canBuy) {
      toast.error("Choose a graphic and a size first");
      return;
    }

    setBusy(true);
    try {
      const blob = await canvasRef.current?.exportBlob();
      if (!blob) {
        toast.error("Could not export your design");
        return;
      }

      const designUrl = await uploadDesign({
        blob,
        productId: baseTee._id,
        backendUrl,
        token,
      });

      await add(baseTee._id, size, {
        design: designUrl,
        quantity: purchaseQuantity(quantity),
      });
      navigate("/cart");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Could not add your custom tee to the cart"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t">
      <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* The Canvas */}
        <div className="md:col-span-2">
          <TshirtCanvas ref={canvasRef} design={design} onMove={moveTo} />
        </div>

        {/* The Controls */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {baseTee && (
            <p className="text-sm text-gray-500">
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

          <TeePurchase
            sizes={sizes}
            size={size}
            onSize={setSize}
            quantity={quantity}
            onQuantity={setQuantity}
            canBuy={canBuy}
            busy={busy}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
};

export default TshirtGeneratorPage;
