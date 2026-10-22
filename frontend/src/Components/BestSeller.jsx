import { useCatalogue } from "../catalogue/CatalogueContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { ProductGridSkeleton } from "./ProductSkeleton";

const BESTSELLER_LIMIT = 5;

const BestSeller = () => {
  const { products, loading, error } = useCatalogue();

  // Derived during render rather than copied into state by an effect, so the
  // rail never renders one empty frame after the catalogue arrives.
  const bestSeller = products
    .filter((product) => product.bestseller)
    .slice(0, BESTSELLER_LIMIT);

  return (
    <div className="my-10" aria-busy={loading}>
      <div className="text-center text-3xl py-8">
        <Title text1={"BEST"} text2={"SELLERS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Our best-selling products that our customers can not get enough of.
          Shop the most popular items from our store.
        </p>
      </div>

      {error ? (
        <p className="text-center text-sm text-gray-500">
          Bestsellers are unavailable right now.
        </p>
      ) : loading ? (
        <ProductGridSkeleton count={BESTSELLER_LIMIT} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
          {bestSeller.map((product) => (
            <ProductItem
              key={product._id}
              id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSeller;
