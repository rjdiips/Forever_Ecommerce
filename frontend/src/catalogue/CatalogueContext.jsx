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
import { catalogueProducts, orderProducts } from "@forever/shared";
import { BACKEND_URL } from "../config";
import { relatedTo as selectRelated } from "./related";

const CatalogueContext = createContext(null);

// The one source of Product data for the storefront: the fetched list split
// into the shop catalogue and the full list, lookups by id, related products,
// and the search query. Components never scan a product array themselves.
export const CatalogueProvider = ({ children }) => {
  const [allProducts, setAllProducts] = useState([]);
  // Three states, not a boolean: a failed request must be able to end the
  // rails' placeholder instead of leaving them shimmering forever.
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${BACKEND_URL}/api/product/list`)
      .then((response) => {
        if (cancelled) return;
        if (response.data.success) {
          setAllProducts(response.data.data.products ?? []);
          setStatus("ready");
        } else {
          setStatus("error");
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        toast.error(error.response?.data?.message || error.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The shop catalogue excludes the Custom Tee base; the full list is kept so
  // a lookup can still resolve the base a Cart line names. Both are shown in
  // the admin-set display order, so a newly added Product lands at the end.
  const products = useMemo(
    () => orderProducts(catalogueProducts(allProducts)),
    [allProducts]
  );

  const byId = useMemo(
    () =>
      new Map(
        allProducts.map((product) => [String(product._id), product])
      ),
    [allProducts]
  );

  const getById = useCallback(
    (productId) => byId.get(String(productId)),
    [byId]
  );

  const relatedTo = useCallback(
    (product, limit) => selectRelated(products, product, limit),
    [products]
  );

  const value = useMemo(
    () => ({
      products,
      // The full list, for the Cart's price lookup and the tee generator's base.
      allProducts,
      loading: status === "loading",
      error: status === "error",
      getById,
      relatedTo,
      search,
      setSearch,
      showSearch,
      setShowSearch,
    }),
    [
      products,
      allProducts,
      status,
      getById,
      relatedTo,
      search,
      showSearch,
    ]
  );

  return (
    <CatalogueContext.Provider value={value}>
      {children}
    </CatalogueContext.Provider>
  );
};

export const useCatalogue = () => {
  const catalogue = useContext(CatalogueContext);
  if (!catalogue) {
    throw new Error("useCatalogue must be used inside a CatalogueProvider");
  }
  return catalogue;
};
