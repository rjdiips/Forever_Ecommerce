import { Link, useNavigate } from "react-router-dom";
import { cartLineId, formatMoney } from "@forever/shared";
import { useCatalogue } from "../catalogue/CatalogueContext";
import { useCart } from "../cart/CartContext";
import Title from "../Components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../Components/CartTotal";

// An empty bag used to render as a blank page with a $10.00 shipping fee and a
// live checkout button. This is the only thing on the page when there is
// nothing to check out.
const EmptyCart = () => (
  <div className="border-y border-gray-200 px-6 py-16 text-center sm:py-20">
    <img src={assets.empty_cart} alt="" className="mx-auto w-44 sm:w-56" />

    <p className="mt-8 text-[9px] uppercase tracking-[0.3em] text-[#b8838e]">
      Forever / Your bag
    </p>
    <p className="editorial-display mt-3 text-2xl text-[#111] sm:text-3xl">
      Your cart is empty.
    </p>
    <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-600">
      Nothing in your bag yet. Browse the collection and find a piece worth
      keeping — it will show up here.
    </p>

    <Link
      to="/collection"
      className="mt-9 inline-block bg-black px-8 py-3 text-sm text-white transition-colors hover:bg-gray-800"
    >
      SHOP THE COLLECTION
    </Link>
  </div>
);

const Cart = () => {
  const { lineItems, count, loading, update, remove } = useCart();
  const { getById } = useCatalogue();
  const navigate = useNavigate();

  // `count` is the number of pieces in the bag, so an empty state never flashes
  // while the catalogue is still resolving the lines into products.
  const isEmpty = count === 0;

  return (
    <div className="pt-14 border-t">
      <div className="mb-3 text-2xl">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {loading ? (
        <p
          aria-busy="true"
          className="border-y border-gray-200 py-20 text-center text-[9px] uppercase tracking-[0.24em] text-gray-500"
        >
          Loading your bag
        </p>
      ) : isEmpty ? (
        <EmptyCart />
      ) : (
        <CartContents
          lineItems={lineItems}
          getById={getById}
          update={update}
          remove={remove}
          onCheckout={() => navigate("/place-order")}
        />
      )}
    </div>
  );
};

const CartContents = ({ lineItems, getById, update, remove, onCheckout }) => {
  return (
    <>
      {/* Cart Items      */}

      <div>
        {lineItems.map((line) => {
          const product = getById(line.productId);

          // Skip rendering this item until its product is in the catalogue
          if (!product) {
            return null;
          }

          // A Custom Tee shows the design the shopper made, not the base
          // product photo.
          const preview = line.design || product.image[0];

          return (
            <div
              key={cartLineId(line)}
              className="py-3 border-b border-t text-gray-700 grid  grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                <img
                  src={preview}
                  alt={line.design ? "Custom tee design" : ""}
                  className="w-16 sm:w-20"
                />
                <div>
                  <p className="text-sm sm:text-lg font-medium">
                    {product.name}
                  </p>

                  <div className="flex items-center gap-5 mt-2">
                    <p>{formatMoney(line.unitPrice)}</p>
                    <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50 ">
                      {line.size}
                    </p>
                  </div>
                  {line.design && (
                    <p className="mt-1 text-xs text-gray-500">
                      Your custom design
                    </p>
                  )}
                </div>
              </div>

              <input
                onChange={(e) => {
                  const quantity = Number(e.target.value);
                  if (Number.isInteger(quantity) && quantity > 0) {
                    update(line, quantity);
                  }
                }}
                className="border  max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 "
                type="number"
                min={1}
                value={line.quantity}
              />
              <img
                onClick={() => remove(line)}
                src={assets.bin_icon}
                alt=""
                className="w-4 mr-4 sm:w-5 cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />

          <div className="w-full text-end">
            <button
              onClick={onCheckout}
              className="my-8 px-8 py-3 bg-black text-white hover:bg-gray-800 text-sm cursor-pointer"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
