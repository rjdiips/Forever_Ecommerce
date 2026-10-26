import { useParams } from "react-router-dom";
import { useCatalogue } from "../catalogue/CatalogueContext";
import ProductPage from "../product/ProductPage";

// The product route is the live page. The losing prototypes (F, H, and I) are
// kept as standalone files under `src/prototypes/`; nothing imports them, so
// they are not part of the app or the bundle.
const Product = () => {
  const { productId } = useParams();
  const { getById } = useCatalogue();

  return <ProductPage product={getById(productId)} />;
};

export default Product;
