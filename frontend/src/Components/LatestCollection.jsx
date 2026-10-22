import { useCatalogue } from "../catalogue/CatalogueContext";
import Title from "../Components/Title";
import ProductItem from "../Components/ProductItem";
import { ProductGridSkeleton } from "../Components/ProductSkeleton";

const LATEST_LIMIT = 10;

const LatestCollection = () => {
  const { products, loading, error } = useCatalogue();

  // The catalogue is in the admin-set display order, and a newly added Product
  // lands at the end of it, so the rail is the last slice: the newest arrivals,
  // still in the order the admin set. Reordering them in the admin reorders
  // this rail too.
  const latestProducts = products.slice(-LATEST_LIMIT);

  return (
    <div className="my-10" aria-busy={loading}>
      <div className="py-8 text-center text-3xl">
        <Title text1={"LATEST"} text2={"COLLECTIONS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Discover our latest edit that blends style and comfort. Explore the
          trends we have picked for this collection, curated just for you.
        </p>
      </div>

      {/* Rendering Products */}
      {error ? (
        <p className="text-center text-sm text-gray-500">
          Products are unavailable right now.
        </p>
      ) : loading ? (
        <ProductGridSkeleton count={LATEST_LIMIT} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
          {latestProducts.map((product) => (
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

export default LatestCollection;
