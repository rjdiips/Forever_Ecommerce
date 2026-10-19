import { useContext } from "react";
import { cartLineId, formatMoney } from "@forever/shared";
import { ShopContext } from "../Context/ShopContext";
import { useCatalogue } from "../catalogue/CatalogueContext";
import { useCart } from "../cart/CartContext";
import Title from "../Components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../Components/CartTotal";

const Cart = () => {
  const { lineItems, update, remove } = useCart();
  const { getById } = useCatalogue();
  const { navigate } = useContext(ShopContext);

  return (
    <div className="pt-14 border-t">
      <div className="mb-3 text-2xl">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

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
              onClick={() => navigate("/place-order")}
              className="my-8 px-8 py-3 bg-black text-white hover:bg-gray-800 text-sm cursor-pointer"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
