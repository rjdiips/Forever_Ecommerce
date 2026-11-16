import { Link, useNavigate } from "react-router-dom";
import { cartLineId, formatMoney } from "@forever/shared";
import { useCatalogue } from "../catalogue/CatalogueContext";
import { useCart } from "../cart/CartContext";
import Button from "../Components/Button";
import CartTotal from "../Components/CartTotal";
import InlineNotice from "../Components/InlineNotice";
import PageHeading from "../Components/PageHeading";
import { assets } from "../assets/assets";

// An empty bag used to render as a blank page with a $10.00 shipping fee and a
// live checkout button. This is the only thing on the page when there is
// nothing to check out.
const EmptyCart = () => (
  <div className="border-y border-gray-200 px-6 py-16 text-center sm:py-20">
    <img src={assets.empty_cart} alt="" className="mx-auto w-44 sm:w-56" />

    <p className="mt-8 text-[9px] uppercase tracking-[0.3em] text-[#a85580]">
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
      className="mt-9 inline-block bg-[#111] px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-white transition-colors hover:bg-gray-800"
    >
      Shop the collection
    </Link>
  </div>
);

const Cart = () => {
  const { lineItems, count, loading, loadError, update, remove } = useCart();
  const { getById } = useCatalogue();
  const navigate = useNavigate();

  // `count` is the number of pieces in the bag, so an empty state never flashes
  // while the catalogue is still resolving the lines into products.
  const isEmpty = count === 0;

  return (
    <div className="border-t pt-10">
      {loading ? (
        <p
          aria-busy="true"
          className="border-y border-gray-200 py-20 text-center text-[9px] uppercase tracking-[0.24em] text-gray-500"
        >
          Loading your bag
        </p>
      ) : loadError && isEmpty ? (
        <div className="border-y border-gray-200 py-20 text-center">
          <InlineNotice className="justify-center">
            We couldn&rsquo;t load your bag. Refresh to try again.
          </InlineNotice>
        </div>
      ) : isEmpty ? (
        <EmptyCart />
      ) : (
        <CartContents
          lineItems={lineItems}
          count={count}
          getById={getById}
          update={update}
          remove={remove}
          onCheckout={() => navigate("/place-order")}
        />
      )}
    </div>
  );
};

const CartContents = ({ lineItems, count, getById, update, remove, onCheckout }) => {
  return (
    <>
      <PageHeading
        label="Forever / Your bag"
        title="Your cart"
        note={`${count} ${count === 1 ? "piece" : "pieces"}`}
      />

      <div className="mt-2 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <ul>
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
              <li
                key={cartLineId(line)}
                className="flex items-start gap-5 border-b border-gray-200 py-5 sm:gap-6"
              >
                <div className="w-20 shrink-0 bg-gray-100 sm:w-24">
                  <img
                    src={preview}
                    alt={line.design ? "Your custom design" : ""}
                    className="aspect-[390/450] w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
                    <p className="text-[15px] leading-snug text-[#111]">
                      {product.name}
                    </p>
                    <p className="editorial-display text-lg leading-none text-[#111] tabular-nums">
                      {formatMoney(line.unitPrice * line.quantity)}
                    </p>
                  </div>

                  <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                    Size {line.size}
                    <span aria-hidden="true" className="px-2 text-gray-300">
                      /
                    </span>
                    <span className="tabular-nums">
                      {formatMoney(line.unitPrice)} each
                    </span>
                    {line.design ? (
                      <>
                        <span aria-hidden="true" className="px-2 text-gray-300">
                          /
                        </span>
                        Custom design
                      </>
                    ) : null}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                    <label className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                        Quantity
                      </span>
                      <input
                        aria-label={`Quantity for ${product.name}`}
                        onChange={(e) => {
                          const quantity = Number(e.target.value);
                          if (Number.isInteger(quantity) && quantity > 0) {
                            update(line, quantity);
                          }
                        }}
                        className="w-14 border border-gray-300 bg-white px-2 py-1.5 text-center text-sm text-[#111] tabular-nums outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111]"
                        type="number"
                        min={1}
                        value={line.quantity}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => remove(line)}
                      className="border-b border-current pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-[#8f4a56]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="border border-[#111] bg-white p-5 shadow-[7px_7px_0_rgba(17,17,17,0.06)] sm:p-6">
            <CartTotal />

            <Button onClick={onCheckout} className="mt-6 w-full">
              Proceed to checkout
            </Button>

            <Link
              to="/collection"
              className="mt-5 inline-flex items-center gap-2 border-b border-current pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-600 transition-colors hover:text-[#111]"
            >
              <span aria-hidden="true">←</span>
              Keep browsing
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Cart;
