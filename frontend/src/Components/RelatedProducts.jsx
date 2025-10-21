import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import Title from "../Components/Title";
import ProductItem from "./ProductItem";

const RelatedProducts = ({ category, subCategory, id }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (products.length > 0) {
      // Start transition
      setIsTransitioning(true);

      // Small delay to show fade out effect
      const transitionTimer = setTimeout(() => {
        let productsCopy = products.slice();
        productsCopy = productsCopy.filter(
          (item) => category === item.category
        );
        productsCopy = productsCopy.filter(
          (item) => subCategory === item.subCategory
        );
        productsCopy = productsCopy.filter((item) => id !== item._id);
        setRelated(productsCopy.slice(0, 5));

        // End transition after updating content
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 200);

      return () => {
        clearTimeout(transitionTimer);
      };
    }
  }, [products, id, category, subCategory]);

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
        {related.map((item, index) => (
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
