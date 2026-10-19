import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DELIVERY_FEE } from "@forever/shared";
import {
  addLine,
  count,
  linesFromCartData,
  lineId,
  priceOfFromProducts,
  pricedLines,
  setQuantity,
  subtotal,
  total as cartTotal,
} from "./cartMath";

const CartContext = createContext(null);

// The Cart owns its lines, the money math over them, and the sync that keeps a
// signed-in cart on the server. Auth and the catalogue reach it as props, so it
// stays independent of both.
export const CartProvider = ({ token, products = [], backendUrl, children }) => {
  const [lines, setLines] = useState([]);

  const priceOf = useMemo(() => priceOfFromProducts(products), [products]);

  // A signed-in cart lives on the server: load it whenever the token changes,
  // and drop it on logout.
  useEffect(() => {
    if (!token) {
      setLines([]);
      return undefined;
    }

    let cancelled = false;
    axios
      .post(`${backendUrl}/api/cart/get`, {}, { headers: { token } })
      .then((response) => {
        if (!cancelled && response.data.success) {
          setLines(linesFromCartData(response.data.data.cartData));
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [token, backendUrl]);

  const add = useCallback(
    async (productId, size) => {
      if (!size) {
        toast.error("Please select a size");
        return;
      }

      setLines((current) => addLine(current, { productId, size }));

      if (!token) return;

      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId: productId, size },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success(response.data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    },
    [token, backendUrl]
  );

  const update = useCallback(
    async (line, quantity) => {
      setLines((current) => setQuantity(current, lineId(line), quantity));

      if (!token) return;

      try {
        await axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId: line.productId, size: line.size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    },
    [token, backendUrl]
  );

  const remove = useCallback((line) => update(line, 0), [update]);

  const clear = useCallback(() => setLines([]), []);

  const lineItems = useMemo(() => pricedLines(lines, priceOf), [lines, priceOf]);
  const subtotalCents = useMemo(() => subtotal(lineItems), [lineItems]);
  const itemCount = useMemo(() => count(lines), [lines]);

  const value = useMemo(
    () => ({
      lineItems,
      subtotal: subtotalCents,
      deliveryFee: DELIVERY_FEE,
      total: cartTotal(subtotalCents, DELIVERY_FEE),
      count: itemCount,
      add,
      update,
      remove,
      clear,
    }),
    [lineItems, subtotalCents, itemCount, add, update, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const cart = useContext(CartContext);
  if (!cart) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return cart;
};
