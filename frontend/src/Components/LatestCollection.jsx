import { useEffect, useState } from "react";
import { useCatalogue } from "../catalogue/CatalogueContext";
import Title from "../Components/Title";
import ProductItem from "../Components/ProductItem";

const LatestCollection = () => {
  const { products } = useCatalogue();
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    // The catalogue is in display order, which is not necessarily newest first,
    // so the "latest" rail sorts by the date each Product was added.
    const latest = [...products]
      .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
      .slice(0, 10);
    setLatestProducts(latest);
  }, [products]);
  return (
    <div className="my-10">
      <div className="py-8 text-center text-3xl">
        <Title text1={"LATEST"} text2={"COLLECTIONS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Discover our newest arrivals that blend style and comfort. Explore the
          latest trends in fashion, curated just for you.
        </p>
      </div>

      {/* Rendering Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {latestProducts.map((product, idx) => (
          <ProductItem
            key={idx}
            id={product._id}
            image={product.image}
            name={product.name}
            price={product.price}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
