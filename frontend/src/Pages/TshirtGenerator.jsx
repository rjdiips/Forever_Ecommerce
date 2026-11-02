import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { findTeeBase, teeColors } from "@forever/shared";
import { toast } from "../toast/toast";
import InlineNotice from "../Components/InlineNotice";
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
  designFileName,
  purchaseQuantity,
  uploadDesign,
} from "../tee/purchase";

const TshirtGeneratorPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { allProducts, loading } = useCatalogue();
  const { add } = useCart();
  const canvasRef = useRef(null);

  // The colours the catalogue actually offers come from its Tee bases, in the
  // bases' display order; the editor never hardcodes a pair, and a colour with
  // no base is not offered. Memoised so the list keeps its identity between
  // renders, which is what stops the draft being re-examined on every render.
  const colors = useMemo(() => teeColors(allProducts), [allProducts]);
  const { design, selectGraphic, moveTo, setScale, setColor, reset } =
    useTeeDesign(colors);

  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(DEFAULT_PURCHASE_QUANTITY);
  const [busy, setBusy] = useState(false);
  // A precondition or a refused add renders beside the button that caused it
  // (ADR-0008); nothing here is a toast.
  const [notice, setNotice] = useState(null);
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
  // to the Cart as a line carrying that design (ADR-0001). Preconditions are
  // questions for this page, so they render under the button rather than as a
  // toast (ADR-0008).
  const handleAddToCart = async () => {
    setNotice(null);

    // Already stated under the canvas; the purchase button is disabled when
    // there is no base to buy.
    if (!baseTee) return;

    if (!token) {
      setNotice(
        <InlineNotice
          action={
            <Link
              to="/login"
              className="border-b border-current pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em]"
            >
              Sign in &rarr;
            </Link>
          }
        >
          Sign in to save this tee to your bag.
        </InlineNotice>
      );
      return;
    }

    // `TeePurchase` prints the reason and disables the button, so the guard
    // stays silent in case the button is ever enabled again.
    if (!canBuy) return;

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

      const result = await add(baseTee._id, size, {
        design: designUrl,
        quantity: purchaseQuantity(quantity),
      });

      if (!result.ok) {
        setNotice(
          <InlineNotice>
            {result.message ||
              "We couldn't add that to your bag. Please try again."}
          </InlineNotice>
        );
        return;
      }

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

  // Download the same rendered design the Cart would receive. The button sits
  // below Add to Cart, so this stays the secondary way out of the editor.
  const handleDownload = async () => {
    try {
      const blob = await canvasRef.current?.exportBlob();
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
          <TshirtControls
            design={design}
            colors={colors}
            onSelectGraphic={selectGraphic}
            onScale={setScale}
            onColor={setColor}
            onReset={reset}
          />

          <TeePurchase
            productName={baseTee?.name}
            price={baseTee?.price}
            sizes={sizes}
            size={size}
            onSize={setSize}
            quantity={quantity}
            onQuantity={setQuantity}
            canBuy={canBuy}
            busy={busy}
            loading={loading}
            notice={notice}
            onAddToCart={handleAddToCart}
            onDownload={handleDownload}
            canDownload={blankReady}
          />
        </div>
      </div>
    </div>
  );
};

export default TshirtGeneratorPage;
