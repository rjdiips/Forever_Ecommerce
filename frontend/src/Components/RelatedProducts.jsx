import { useEffect, useState } from "react";
import { useCatalogue } from "../catalogue/CatalogueContext";
import Title from "../Components/Title";
import ProductItem from "./ProductItem";

const RelatedProducts = ({ product }) => {
  const { relatedTo } = useCatalogue();
  const [related, setRelated] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);

    let fadeTimer;
    const transitionTimer = setTimeout(() => {
      setRelated(relatedTo(product));

      fadeTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(fadeTimer);
    };
  }, [relatedTo, product]);

  return (
    <div className="my-24">
      <div className="text-3xl py-2">
        <Title text1={"RELATED"} text2={"PRODUCTS"} />
      </div>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6 transition-all duration-300 ease-in-out transform ${
          isTransitioning
            ? "opacity-0 translate-y-4 scale-95"
            : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {related.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
