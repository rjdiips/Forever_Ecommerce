import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatProductPrice } from "@forever/shared";
import { useCatalogue } from "../catalogue/CatalogueContext";
import { useCart } from "../cart/CartContext";
import { REVIEW_COUNT, REVIEW_RATING, reviewsFor } from "../reviews/reviews";
import StarRating from "../Components/StarRating";
import ReviewList from "../reviews/ReviewList";
import RelatedProducts from "../Components/RelatedProducts";

const TAB = {
  DELIVERY: "delivery",
  REVIEWS: "reviews",
};

const TABS = [
  { id: TAB.DELIVERY, label: "Delivery & returns" },
  { id: TAB.REVIEWS, label: "Reviews" },
];

const Product = () => {
  const { productId } = useParams();
  const { getById } = useCatalogue();
  const { add } = useCart();
  const productsData = getById(productId);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [tab, setTab] = useState(TABS[0].id);
  const reviews = reviewsFor(productsData?._id);

  useEffect(() => {
    setSize("");
    setImage("");
    setTab(TABS[0].id);
  }, [productId]);

  const shownImage = image || productsData?.image?.[0] || "";

  return productsData ? (
    <div className="border-t pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* ---------------------- Producsts Data ----------------------*/}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* ---------------------- products images ---------------------- */}

        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row ">
          {/* ---------------------- List images ----------------------*/}
          <div className="flex sm:flex-col  overflow-x-auto sm:overflow-y-scroll justify-between  sm:justify-normal sm:w-[18.7%] w-full">
            {productsData.image.map((item, index) => (
              <img
                key={index}
                src={item}
                alt="product"
                onClick={() => setImage(item)}
                className="cursor-pointer w-[24%]  sm:w-full sm:mb-3 flex-shrink-0  object-cover"
              />
            ))}
          </div>

          {/*---------------------- main img---------------------- */}
          <div className="w-full sm:w-[80%]">
            <img
              src={shownImage}
              alt="product"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* ---------------------- products details ---------------------- */}

        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productsData.name}</h1>

          <div className="flex items-center gap-1 mt-2">
            <StarRating rating={REVIEW_RATING} />

            <p className="pl-2">({REVIEW_COUNT})</p>
          </div>

          <p className="mt-5 text-3xl font-medium">
            {formatProductPrice(productsData.price)}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5 ">
            {productsData.description}
          </p>

          {/*  */}

          <div className="flex flex-col gap-4 my-8">
            <p className="">Select Size</p>
            <div className="flex gap-2">
              {productsData.sizes.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSize(item);
                  }}
                  className={`border border-gray-200 py-2 px-4 cursor-pointer transition-all duration-200 ${
                    item === size
                      ? "bg-black text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/*  */}

          <button
            onClick={() => add(productsData._id, size)}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700 transition-colors duration-200 hover:bg-gray-800 cursor-pointer"
          >
            ADD TO CART
          </button>

          <hr className="mt-8 sm:w-4/5 border-t border-gray-200" />

          <div className="flex flex-col gap-1 mt-5 text-sm text-gray-500">
            <p>100% Original product </p>
            <p>Free delivery on order above $49</p>
            <p> Easy return and exchange policy within 7 days </p>
          </div>
        </div>
      </div>

      {/* ---------------------- Delivery and reviews ----------------------*/}

      <div className="mt-10">
        <div className="flex">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-5 py-3 text-sm border cursor-pointer ${
                tab === id
                  ? "font-semibold text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {id === TAB.REVIEWS ? `${label} (${REVIEW_COUNT})` : label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          {tab === TAB.DELIVERY ? (
            <>
              <p>
                Orders over $49 are delivered free; anything below that is
                charged at checkout.
              </p>
              <p>
                Returns and exchanges are accepted within 7 days of delivery.
              </p>
              <p>
                Every product is original stock, checked before it is packed.
              </p>
              <p>
                If something goes wrong, support is available around the clock.
              </p>
            </>
          ) : (
            <ReviewList reviews={reviews} />
          )}
        </div>
      </div>

      {/* ----------------------  Display Products  Products ----------------------*/}

      <RelatedProducts product={productsData} />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
