// Archived prototype, not imported anywhere. The product route renders
// `product/ProductPage`; this was one of the designs that lost. Kept as a
// standalone file for reference — see
// .scratch/product-redesign/issues/01-product-prototype.md.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatProductPrice } from "@forever/shared";
import { useCart } from "../cart/CartContext";
import { useCatalogue } from "../catalogue/CatalogueContext";
import { toast } from "../toast/toast";
import { REVIEW_COUNT, REVIEW_RATING, reviewsFor } from "../reviews/reviews";
import StarRating from "../Components/StarRating";
import { productImage } from "../product/productImage";
import ReviewAllLink from "../product/ReviewAllLink";

// The buy card states what the piece is; delivery and returns are stated once,
// in their own section below, so neither repeats the other.
const DELIVERY = [
  {
    label: "Delivery",
    text: "Free on orders over $49. Below that, charged at checkout.",
  },
  {
    label: "Returns",
    text: "Accepted within 7 days of delivery, unworn and with tags.",
  },
  {
    label: "Exchanges",
    text: "Swap size or colour within the same 7 days.",
  },
];

const SpecRow = ({ label, children }) => (
  <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-4 border-b border-gray-200 py-3.5">
    <dt className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
      {label}
    </dt>
    <dd className="text-[12px] leading-relaxed text-gray-700">{children}</dd>
  </div>
);

// F: the specimen card kept intact, with delivery and returns lifted out of the
// buy card into their own always-visible section, and the three-note review
// spread carried across from D.
const VariantF = ({ product }) => {
  const { add } = useCart();
  const { relatedTo } = useCatalogue();
  const navigate = useNavigate();
  const images = product.image ?? [];
  const [activeImage, setActiveImage] = useState(images[0] ?? "");
  const [size, setSize] = useState("");

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

  const reviews = reviewsFor(product._id);
  const related = relatedTo(product);
  const reference = String(product._id).slice(-6).toUpperCase();

  return (
    <article className="border-t pt-6 sm:pt-10">
      <div className="flex items-center justify-between gap-4 border-b border-[#111] pb-3 text-[9px] uppercase tracking-[0.22em]">
        <div className="flex flex-wrap items-center gap-2 text-gray-500">
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
        <span className="shrink-0 text-[#b8838e] tabular-nums">
          Ref. {reference}
        </span>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
        <div>
          <div className="bg-gray-100">
            <img
              src={productImage(activeImage, 780)}
              alt={product.name}
              className="aspect-[390/450] w-full object-cover"
            />
          </div>

          {images.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(src)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={src === activeImage}
                  className={`overflow-hidden border bg-gray-100 transition-opacity ${
                    src === activeImage
                      ? "border-[#111]"
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
          ) : (
            <div className="mt-3 flex items-center justify-between gap-4 border-t border-gray-200 pt-3 text-[8px] uppercase tracking-[0.22em] text-gray-400">
              <span>Forever / Studio</span>
              <span className="tabular-nums">Plate 01 / 01</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#b8838e]">
            Forever / Specimen
          </p>

          <h1 className="editorial-display mt-3 text-[2rem] leading-[0.94] text-[#111] sm:text-[2.6rem]">
            {product.name}
            <span
              aria-hidden="true"
              className="ml-1.5 inline-block h-2 w-2 rounded-full bg-[#b8838e] align-baseline"
            />
          </h1>

          <div className="mt-4 flex items-center justify-between gap-4 border-b border-[#111] pb-5">
            <p className="text-xl font-medium text-[#111] tabular-nums">
              {formatProductPrice(product.price)}
            </p>
            <div className="flex items-center gap-2">
              <span className="flex gap-0.5">
                <StarRating rating={REVIEW_RATING} />
              </span>
              <span className="text-[9px] uppercase tracking-[0.16em] text-gray-500 tabular-nums">
                ({REVIEW_COUNT})
              </span>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-gray-600">
            {product.description}
          </p>

          <dl className="mt-7">
            <SpecRow label="Category">{product.category}</SpecRow>
            <SpecRow label="Type">{product.subCategory}</SpecRow>

            <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-4 border-b border-gray-200 py-3.5">
              <dt className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
                Size
              </dt>
              <dd className="flex flex-wrap items-center gap-1.5">
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSize(item)}
                    aria-pressed={item === size}
                    className={`h-8 min-w-8 border px-2 text-[10px] uppercase tracking-[0.12em] transition-colors ${
                      item === size
                        ? "border-[#111] bg-[#111] text-white"
                        : "border-gray-300 text-gray-700 hover:border-[#111]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
                <span className="ml-1 text-[9px] uppercase tracking-[0.18em] text-gray-400">
                  {size ? `Size ${size}` : "Select one"}
                </span>
              </dd>
            </div>
          </dl>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => add(product._id, size)}
              className="group flex items-center justify-between gap-4 bg-[#111] px-5 py-4 text-white transition-colors hover:bg-gray-800"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">
                Add to cart
              </span>
              <span className="text-[11px] text-white/70 tabular-nums transition-colors group-hover:text-white">
                {formatProductPrice(product.price)}
              </span>
            </button>
            <button
              type="button"
              onClick={buyNow}
              className="flex items-center justify-between gap-4 border border-[#111] px-5 py-4 text-[#111] transition-colors hover:bg-[#111] hover:text-white"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">
                Buy now
              </span>
              <span aria-hidden="true" className="text-[11px] leading-none">
                →
              </span>
            </button>
          </div>

          <p className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[#b8838e]"
            />
            In stock
          </p>
        </div>
      </div>

      <section className="mt-14" aria-label="Delivery and returns">
        <div className="flex items-end justify-between gap-4 border-b border-[#111] pb-3">
          <h2 className="editorial-display text-2xl text-[#111]">
            Delivery &amp; returns
          </h2>
          <p className="text-[9px] uppercase tracking-[0.22em] text-gray-400">
            Forever / Always
          </p>
        </div>

        <div className="grid border-b border-gray-200 sm:grid-cols-3">
          {DELIVERY.map((item, index) => (
            <div
              key={item.label}
              className={`py-5 sm:px-5 ${
                index > 0
                  ? "border-t border-gray-200 sm:border-l sm:border-t-0"
                  : ""
              }`}
            >
              <p className="text-[9px] uppercase tracking-[0.22em] text-[#b8838e]">
                {item.label}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-label="Reviews">
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

      <section className="mt-12" aria-label="Related pieces">
        <div className="flex items-end justify-between gap-4 border-b border-[#111] pb-3">
          <h2 className="editorial-display text-2xl text-[#111]">
            Also in the collection
          </h2>
          <Link
            to="/collection"
            className="group/link flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-[#111]"
          >
            View all
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover/link:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>

        {related.length > 0 ? (
          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="group block"
              >
                <div className="relative aspect-[390/450] overflow-hidden bg-gray-100">
                  <img
                    src={productImage(item.image?.[0], 480)}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-3 text-[12px] leading-snug text-gray-800">
                  {item.name}
                </p>
                <p className="mt-1 text-[11px] font-medium text-gray-700 tabular-nums">
                  {formatProductPrice(item.price)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-6 text-sm text-gray-500">
            More pieces from this edit are on the way.
          </p>
        )}
      </section>
    </article>
  );
};

export default VariantF;
