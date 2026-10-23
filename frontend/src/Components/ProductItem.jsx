import { useCallback, useState } from "react";
import { formatProductPrice } from "@forever/shared";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const [loaded, setLoaded] = useState(false);

  // A cached image can finish before React attaches onLoad, so check whether
  // the node is already complete when it mounts.
  const handleImageRef = useCallback((node) => {
    if (node?.complete) setLoaded(true);
  }, []);

  return (
    <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
      <div className="relative aspect-[390/450] overflow-hidden bg-gray-100">
        <img
          ref={handleImageRef}
          className={`h-full w-full object-cover transition duration-300 hover:scale-110 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          src={image[0]}
          alt={name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200 motion-reduce:animate-none" />
        )}
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">{formatProductPrice(price)}</p>
    </Link>
  );
};

export default ProductItem;
