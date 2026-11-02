import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { toast } from "../toast/toast";
import {
  DELIVERY_FEE,
  addCartLine,
  cartLineId,
  cartLines,
  setCartLineQuantity,
} from "@forever/shared";
import {
  count,
  priceOfFromProducts,
  pricedLines,
  subtotal,
  total as cartTotal,
} from "./cartMath";

const CartContext = createContext(null);

// The Cart owns its lines, the money math over them, and the sync that keeps a
// signed-in cart on the server. Auth and the catalogue reach it as props, so it
// stays independent of both.
export const CartProvider = ({ token, products = [], backendUrl, children }) => {
  const [lines, setLines] = useState([]);
  // A signed-in cart arrives over the network; the storefront needs to know the
  // bag is still loading so it does not announce "empty" before the lines land.
  const [loading, setLoading] = useState(false);
  // A failed load has no control to point at, but the Cart page has a place to
  // say so, so the page renders this rather than the toast (ADR-0008).
  const [loadError, setLoadError] = useState(false);

  const priceOf = useMemo(() => priceOfFromProducts(products), [products]);

  // A signed-in cart lives on the server: load it whenever the token changes,
  // and drop it on logout.
  useEffect(() => {
    if (!token) {
      setLines([]);
      setLoading(false);
      setLoadError(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    axios
      .post(`${backendUrl}/api/cart/get`, {}, { headers: { token } })
      .then((response) => {
        if (!cancelled && response.data.success) {
          setLines(cartLines(response.data.data.cartData));
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, backendUrl]);

  // `design` is the uploaded URL of a Custom Tee; it is part of the line's
  // identity, so two designs of the same base and size stay separate lines.
  // The Cart never announces the result: it returns it, and the panel that
  // asked renders it (ADR-0008).
  const add = useCallback(
    async (productId, size, { design, quantity = 1 } = {}) => {
      if (!size) {
        return { ok: false, message: "Choose a size to continue." };
      }

      setLines((current) =>
        addCartLine(current, {
          productId,
          size,
          quantity,
          ...(design ? { design } : {}),
        })
      );

      if (!token) return { ok: true };

      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId: productId, size, quantity, ...(design ? { design } : {}) },
          { headers: { token } }
        );

        if (!response.data.success) {
          return {
            ok: false,
            message:
              response.data.message ||
              "We couldn't add that to your bag. Please try again.",
          };
        }

        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          message:
            error.response?.data?.message ||
            "We couldn't add that to your bag. Please try again.",
        };
      }
    },
    [token, backendUrl]
  );

  const update = useCallback(
    async (line, quantity) => {
      setLines((current) =>
        setCartLineQuantity(current, cartLineId(line), quantity)
      );

      if (!token) return;

      try {
        await axios.post(
          `${backendUrl}/api/cart/update`,
          {
            itemId: line.productId,
            size: line.size,
            quantity,
            ...(line.design ? { design: line.design } : {}),
          },
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
      loading,
      loadError,
      add,
      update,
      remove,
      clear,
    }),
    [
      lineItems,
      subtotalCents,
      itemCount,
      loading,
      loadError,
      add,
      update,
      remove,
      clear,
    ]
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
