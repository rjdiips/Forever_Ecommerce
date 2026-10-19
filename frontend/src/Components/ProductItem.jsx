import { formatProductPrice } from "@forever/shared";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  return (
    <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
      <div className="overflow-hidden">
        <img
          className="hover:scale-110 transition ease-in-outout"
          src={image[0]}
          alt=""
        />
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">{formatProductPrice(price)}</p>
    </Link>
  );
};

export default ProductItem;
