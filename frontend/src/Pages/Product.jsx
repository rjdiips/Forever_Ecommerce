import { useParams } from "react-router-dom";
import { useCatalogue } from "../catalogue/CatalogueContext";
import ProductPage from "../product/ProductPage";

// The product route is the live page. The losing prototypes (F, H, and I) were
// deleted once the redesign shipped; git history still has them.
const Product = () => {
  const { productId } = useParams();
  const { getById } = useCatalogue();

  return <ProductPage product={getById(productId)} />;
};

export default Product;
