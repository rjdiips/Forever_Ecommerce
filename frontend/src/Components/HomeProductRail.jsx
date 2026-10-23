import { Link } from "react-router-dom";
import { formatProductPrice } from "@forever/shared";
import { Reveal } from "./Reveal";

const HomeProductCard = ({ product }) => (
  <Link
    to={`/product/${product._id}`}
    className="group block text-gray-700"
  >
    <div className="relative aspect-square overflow-hidden bg-gray-100">
      <img
        src={product.image?.[0]}
        alt={product.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
      />
    </div>
    <div className="relative mt-3 pb-2">
      <p className="text-sm">{product.name}</p>
      <span className="absolute bottom-0 left-0 h-px w-0 bg-gray-700 transition-[width] duration-500 group-hover:w-10" />
    </div>
    <p className="text-sm font-medium">{formatProductPrice(product.price)}</p>
  </Link>
);

export const ViewAllCard = () => (
  <Link
    to="/collection"
    aria-label="View the full collection"
    className="group flex h-full min-h-full aspect-[3/4] flex-col items-center justify-center px-4 text-center"
  >
    <span className="editorial-display text-2xl leading-none text-[#111] sm:text-3xl">
      View all
    </span>
    <span className="mt-5 h-px w-8 bg-[#111] transition-[width] duration-500 group-hover:w-12" />
    <span className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500">
      Shop the collection <span aria-hidden="true">→</span>
    </span>
  </Link>
);

const HomeProductRail = ({ products, delayStep = 70, endSlot = null }) => (
  <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {products.map((product, index) => (
      <Reveal key={product._id} delay={index * delayStep}>
        <HomeProductCard product={product} />
      </Reveal>
    ))}
    {endSlot && (
      <Reveal className="h-full" delay={products.length * delayStep}>
        {endSlot}
      </Reveal>
    )}
  </div>
);

export default HomeProductRail;
