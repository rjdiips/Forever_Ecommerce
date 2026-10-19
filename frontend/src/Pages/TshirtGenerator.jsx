import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { findTeeBase, formatProductPrice, teeColors } from "@forever/shared";
import { toast } from "react-toastify";
import TshirtCanvas from "../Components/TshirtCanvas";
import TshirtControls from "../Components/TshirtControls";
import TeePurchase from "../Components/TeePurchase";
import { useAuth } from "../auth/AuthContext";
import { useCatalogue } from "../catalogue/CatalogueContext";
import { useCart } from "../cart/CartContext";
import { BACKEND_URL } from "../config";
import { teeBlankUrl } from "../tee/blank";
import { useTeeDesign } from "../tee/useTeeDesign";
import {
  DEFAULT_PURCHASE_QUANTITY,
  canBuyCustomTee,
  purchaseQuantity,
  uploadDesign,
} from "../tee/purchase";

const TshirtGeneratorPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { allProducts, loading } = useCatalogue();
  const { add } = useCart();
  const canvasRef = useRef(null);

  // The colours the catalogue actually offers come from its Tee bases; the
  // editor never hardcodes a pair, and a colour with no base is not offered.
  const colors = teeColors(allProducts);
  const { design, selectGraphic, moveTo, setScale, setColor, reset } =
    useTeeDesign(colors);

  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(DEFAULT_PURCHASE_QUANTITY);
  const [busy, setBusy] = useState(false);
  // The blank arrives over the network, so the page waits for it before it will
  // export or sell: "loading", "loaded", "error", or "unavailable" when the
  // chosen colour has no base (or its base has no image).
  const [blankState, setBlankState] = useState("loading");

  // The chosen colour decides the Tee base (ADR-0005): the base supplies the
  // price, the sizes and the blank image the generator designs onto.
  const baseTee = findTeeBase(allProducts, design.color);
  const blankUrl = teeBlankUrl(baseTee?.image?.[0]);
  const blankReady = blankState === "loaded";
  const sizes = baseTee?.sizes ?? [];
  const canBuy = blankReady && Boolean(baseTee) && canBuyCustomTee({
    hasGraphic: Boolean(design.graphic),
    size,
  });

  // A blank canvas with an explanation beats designing onto a shape that is not
  // the tee: nothing is drawn until the base's blank has loaded.
  const blankMessage =
    loading || blankState === "loading"
      ? "Loading your tee…"
      : blankState === "error"
        ? "Could not load the tee image. Please check your connection and try again."
        : blankState === "unavailable"
          ? "This tee colour is not available right now."
          : null;

  // Export the finished Tee draft, store the design, then add the base Product
  // to the Cart as a line carrying that design (ADR-0001).
  const handleAddToCart = async () => {
    if (!baseTee) {
      toast.error("This tee colour is not available right now");
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
        backendUrl: BACKEND_URL,
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
          <TshirtCanvas
            ref={canvasRef}
            design={design}
            blankUrl={blankUrl}
            onBlankStatus={setBlankState}
            onMove={moveTo}
          />
          {blankMessage && (
            <p className="mt-3 text-sm text-gray-500" role="status">
              {blankMessage}
            </p>
          )}
        </div>

        {/* The Controls */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {baseTee && (
            <p className="text-sm text-gray-500">
              Designing onto {baseTee.name} · {formatProductPrice(baseTee.price)}
            </p>
          )}

          <TshirtControls
            design={design}
            colors={colors}
            onSelectGraphic={selectGraphic}
            onScale={setScale}
            onColor={setColor}
            onReset={reset}
            onExport={() => canvasRef.current?.exportBlob()}
            canExport={blankReady}
          />

          <TeePurchase
            sizes={sizes}
            size={size}
            onSize={setSize}
            quantity={quantity}
            onQuantity={setQuantity}
            canBuy={canBuy}
            busy={busy}
            loading={loading}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
};

export default TshirtGeneratorPage;
