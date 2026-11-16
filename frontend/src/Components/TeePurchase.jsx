import { formatProductPrice } from "@forever/shared";
import Button from "./Button";
import { purchaseQuantity } from "../tee/purchase";

// The purchase half of the tee generator: shows the tee being bought, then
// pick a size and a quantity, then hand the finished design to the Cart.
// Download sits below the Cart action because buying the tee is the point of
// the generator; the export itself lives in the page, so this stays easy to
// read.
const TeePurchase = ({
  productName,
  price,
  sizes = [],
  size,
  onSize,
  quantity,
  onQuantity,
  canBuy,
  busy,
  loading,
  notice = null,
  onAddToCart,
  onDownload,
  canDownload = true,
}) => {
  return (
    <div className="border border-[#111] bg-white p-5 shadow-[7px_7px_0_rgba(17,17,17,0.06)]">
      <p className="text-[9px] uppercase tracking-[0.3em] text-[#a85580]">
        Forever / The tee
      </p>

      {(productName || price != null) && (
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          {productName && (
            <h2 className="editorial-display text-xl text-[#111]">
              {productName}
            </h2>
          )}
          {price != null && (
            <p className="shrink-0 text-xl font-medium text-[#111] tabular-nums">
              {formatProductPrice(price)}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-gray-200 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#111]">
          Size
        </p>

        {sizes.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            {loading
              ? "Loading the Custom Tee…"
              : "The Custom Tee is not available right now."}
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSize(option)}
                aria-pressed={option === size}
                className={`h-11 min-w-12 border px-3 text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  option === size
                    ? "border-[#111] bg-[#111] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-[#111]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5">
        <label
          htmlFor="tee-quantity"
          className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#111]"
        >
          Quantity
        </label>
        <input
          id="tee-quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => onQuantity(purchaseQuantity(event.target.value))}
          className="mt-3 block w-20 border border-gray-300 bg-white px-3 py-2 text-sm text-[#111] tabular-nums outline-none transition-colors focus:border-[#111] focus:ring-1 focus:ring-[#111]"
        />
      </div>

      {notice ? <div className="mt-4">{notice}</div> : null}

      <Button onClick={onAddToCart} disabled={!canBuy || busy} className="mt-6 w-full">
        {busy ? "Preparing your design…" : "Add custom tee to cart"}
        {!busy && <span aria-hidden="true">→</span>}
      </Button>

      {!canBuy && !loading && (
        <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
          Choose a graphic and a size to add this tee to your cart.
        </p>
      )}

      <Button
        variant="outline"
        onClick={onDownload}
        disabled={!canDownload}
        className="mt-3 w-full"
      >
        Download design
      </Button>
    </div>
  );
};

export default TeePurchase;
