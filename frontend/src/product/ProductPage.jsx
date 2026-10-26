import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatProductPrice } from "@forever/shared";
import { useCart } from "../cart/CartContext";
import { useCatalogue } from "../catalogue/CatalogueContext";
import { toast } from "../toast/toast";
import { REVIEW_COUNT, REVIEW_RATING, reviewsFor } from "../reviews/reviews";
import StarRating from "../Components/StarRating";
import HomeProductRail from "../Components/HomeProductRail";
import { Reveal } from "../Components/Reveal";
import { productImage } from "./productImage";
import ProductTitle from "./ProductTitle";
import ReviewAllLink from "./ReviewAllLink";

// Delivery and returns are stated once, in their own open section, so the buy
// panel never repeats them above the button.
const DELIVERY = [
  {
    label: "Delivery",
    text: "Orders over $49 are delivered free; anything below that is charged at checkout.",
  },
  {
    label: "Returns",
    text: "Returns and exchanges are accepted within 7 days of delivery.",
  },
  {
    label: "Exchanges",
    text: "Swap size or colour within the same 7 days.",
  },
];

// The product page: a plate with a thumbnail rail beside one framed purchase
// panel. Delivery, returns, and reviews are open sections below it rather than
// tabs, so nothing about the piece is hidden behind a click.
const ProductPage = ({ product }) => {
  const { add } = useCart();
  const { relatedTo } = useCatalogue();
  const navigate = useNavigate();
  const images = product?.image ?? [];
  const [pickedImage, setPickedImage] = useState("");
  const [size, setSize] = useState("");

  // The catalogue arrives after the first paint, and moving between pieces
  // reuses this component, so neither a size nor a chosen plate may survive
  // the change.
  useEffect(() => {
    setSize("");
    setPickedImage("");
  }, [product?._id]);

  const activeImage = images.includes(pickedImage)
    ? pickedImage
    : images[0] ?? "";

  // Buy Now is Add to cart plus the checkout step. The size guard matches the
  // cart's own, so the toast is the same one the cart would raise.
  const buyNow = async () => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }

    await add(product._id, size);
    navigate("/place-order");
  };

  // The catalogue loads asynchronously; hold the space rather than flashing an
  // empty frame.
  if (!product) return <div className="opacity-0" />;

  const reviews = reviewsFor(product._id);
  const related = relatedTo(product);
  const activeIndex = Math.max(0, images.indexOf(activeImage));

  return (
    <article className="border-t pt-6 sm:pt-10">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4 text-[9px] uppercase tracking-[0.22em] text-gray-500"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/collection"
            className="transition-colors hover:text-[#111]"
          >
            Collection
          </Link>
          <span aria-hidden="true" className="text-gray-300">
            /
          </span>
          <span>{product.category}</span>
          <span aria-hidden="true" className="text-gray-300">
            /
          </span>
          <span className="text-[#111]">{product.subCategory}</span>
        </div>
        <span className="hidden text-[#b8838e] sm:block">
          Forever / The piece
        </span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
        {/* Plate and thumbnails. The rail only earns its space with more than
            one image, which most products here do not have. */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex gap-3">
            {images.length > 1 && (
              <div className="hidden w-16 shrink-0 flex-col gap-3 sm:flex">
                {images.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setPickedImage(src)}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={src === activeImage}
                    className={`overflow-hidden border bg-gray-100 transition-opacity ${
                      src === activeImage
                        ? "border-[#111] opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={productImage(src, 160)}
                      alt=""
                      className="aspect-[390/450] w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="relative min-w-0 flex-1 overflow-hidden bg-gray-100">
              <img
                src={productImage(activeImage, 780)}
                alt={product.name}
                className="aspect-[390/450] h-full w-full object-cover"
              />
              {images.length > 1 && (
                <p className="absolute left-4 top-4 bg-white/90 px-2.5 py-1 text-[8px] uppercase tracking-[0.22em] text-[#111] tabular-nums">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(images.length).padStart(2, "0")}
                </p>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 sm:hidden">
              {images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setPickedImage(src)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={src === activeImage}
                  className={`w-16 shrink-0 overflow-hidden border bg-gray-100 ${
                    src === activeImage
                      ? "border-[#111]"
                      : "border-transparent opacity-60"
                  }`}
                >
                  <img
                    src={productImage(src, 160)}
                    alt=""
                    className="aspect-[390/450] w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 hidden items-center justify-between border-t border-gray-200 pt-3 text-[8px] uppercase tracking-[0.22em] text-gray-400 sm:flex">
            <span>Forever / Studio</span>
            <span className="tabular-nums">
              Ref. {String(product._id).slice(-4).toUpperCase()}
            </span>
          </div>
        </div>

        <Reveal delay={80}>
          <div className="border border-[#111] bg-white p-5 shadow-[7px_7px_0_rgba(17,17,17,0.06)] sm:p-7">
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#b8838e]">
              {product.category} / {product.subCategory}
            </p>

            <ProductTitle name={product.name} />

            <div className="mt-4 flex items-center gap-2">
              <span className="flex gap-0.5">
                <StarRating rating={REVIEW_RATING} />
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-gray-500 tabular-nums">
                ({REVIEW_COUNT} reviews)
              </span>
            </div>

            <p className="mt-5 border-t border-gray-200 pt-4 text-2xl font-medium text-[#111] tabular-nums">
              {formatProductPrice(product.price)}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>

            <div className="mt-7 border-t border-gray-200 pt-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#111]">
                  Select size
                </p>
                <p className="text-[9px] uppercase tracking-[0.18em] text-gray-400">
                  {size ? `Size ${size}` : "Required"}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSize(item)}
                    aria-pressed={item === size}
                    className={`h-11 min-w-12 border px-3 text-[11px] uppercase tracking-[0.14em] transition-colors ${
                      item === size
                        ? "border-[#111] bg-[#111] text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-[#111]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => add(product._id, size)}
                className="group flex items-center justify-between gap-4 bg-[#111] px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.26em] text-white transition-colors hover:bg-gray-800"
              >
                Add to cart
                <span
                  aria-hidden="true"
                  className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </button>
              <button
                type="button"
                onClick={buyNow}
                className="flex items-center justify-center border border-[#111] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#111] transition-colors hover:bg-[#111] hover:text-white"
              >
                Buy now
              </button>
            </div>

            <p className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-4 text-[10px] uppercase tracking-[0.18em] text-gray-500">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[#b8838e]"
              />
              In stock
            </p>
          </div>
        </Reveal>
      </div>

      <section className="mt-16" aria-label="Delivery and returns">
        <div className="flex items-end justify-between gap-4 border-b border-[#111] pb-3">
          <h2 className="editorial-display text-2xl text-[#111]">
            Delivery &amp; returns
          </h2>
          <p className="text-[9px] uppercase tracking-[0.22em] text-gray-400">
            Forever / Service
          </p>
        </div>

        <dl className="grid gap-x-12 gap-y-7 py-6 sm:grid-cols-3">
          {DELIVERY.map((note) => (
            <div key={note.label}>
              <dt className="text-[9px] uppercase tracking-[0.2em] text-[#b8838e]">
                {note.label}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-gray-600">
                {note.text}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 border-t border-gray-200 pt-10" aria-label="Reviews">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="editorial-display text-2xl text-[#111]">
            Reviews <span className="text-[#b8838e]">({REVIEW_COUNT})</span>
          </h2>
          <div className="flex items-baseline gap-6">
            <p className="text-[9px] uppercase tracking-[0.22em] text-gray-400 tabular-nums">
              Three recent notes
            </p>
            <ReviewAllLink />
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="border-t border-gray-200 pt-4">
              <p
                aria-hidden="true"
                className="editorial-display text-3xl leading-none text-[#b8838e]"
              >
                &ldquo;
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {review.text}
              </p>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-gray-800">
                    {review.name}
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-gray-400">
                    {review.date}
                  </p>
                </div>
                <span className="flex shrink-0 gap-0.5 pt-0.5">
                  <StarRating rating={review.rating} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="mt-12 border-t border-gray-200 pt-12 sm:mt-14"
        aria-label="Related pieces"
      >
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#b8838e]">
              Forever / Continue
            </p>
            <h2 className="editorial-display mt-3 text-3xl text-[#111]">
              You may also like
            </h2>
          </div>

          <Link
            to="/collection"
            className="group/link hidden flex-col items-start gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#111] sm:flex"
          >
            View all
            <span
              aria-hidden="true"
              className="h-px w-8 bg-[#111] transition-[width] duration-500 group-hover/link:w-14"
            />
          </Link>
        </div>

        {related.length > 0 ? (
          <HomeProductRail products={related} />
        ) : (
          <p className="mt-8 text-sm text-gray-500">
            More pieces from this edit are on the way.
          </p>
        )}
      </section>
    </article>
  );
};

export default ProductPage;
