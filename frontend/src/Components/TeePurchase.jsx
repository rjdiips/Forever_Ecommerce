import { purchaseQuantity } from "../tee/purchase";

// The purchase half of the tee generator: pick a size and a quantity, then hand
// the finished design to the Cart. Presentation only — the export, upload and
// Cart call live in the page, so this stays easy to read.
const TeePurchase = ({
  sizes = [],
  size,
  onSize,
  quantity,
  onQuantity,
  canBuy,
  busy,
  loading,
  onAddToCart,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg shadow-lg">
      <div>
        <h3 className="text-lg font-semibold mb-2">Size</h3>
        {sizes.length === 0 ? (
          <p className="text-sm text-gray-500">
            {loading
              ? "Loading the Custom Tee..."
              : "The Custom Tee is not available right now."}
          </p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {sizes.map((option) => (
              <button
                key={option}
                onClick={() => onSize(option)}
                className={`border border-gray-200 py-2 px-4 cursor-pointer transition-all duration-200 ${
                  option === size
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Quantity</h3>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => onQuantity(purchaseQuantity(event.target.value))}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-24"
        />
      </div>

      <button
        onClick={onAddToCart}
        disabled={!canBuy || busy}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {busy ? "PREPARING YOUR DESIGN..." : "ADD CUSTOM TEE TO CART"}
      </button>
      {!canBuy && !loading && (
        <p className="text-sm text-gray-500">
          Choose a graphic and a size to add this tee to your cart.
        </p>
      )}
    </div>
  );
};

export default TeePurchase;
