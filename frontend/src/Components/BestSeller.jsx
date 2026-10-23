import { useCatalogue } from "../catalogue/CatalogueContext";
import HomeProductRail from "./HomeProductRail";
import HomeSectionHeading from "./HomeSectionHeading";
import { ProductGridSkeleton } from "./ProductSkeleton";

const BESTSELLER_LIMIT = 5;

const BestSeller = () => {
  const { products, loading, error } = useCatalogue();

  // Derived during render rather than copied into state by an effect, so the
  // rail never renders one empty frame after the catalogue arrives. If the
  // admin has not marked any bestsellers yet, the first products stand in.
  const marked = products.filter((product) => product.bestseller);
  const bestSeller = (marked.length > 0 ? marked : products).slice(
    0,
    BESTSELLER_LIMIT
  );

  return (
    <section className="py-16 sm:py-24" aria-busy={loading}>
      <HomeSectionHeading label="Most loved" title="Best Sellers">
        The pieces our customers cannot get enough of, chosen for the way they
        move and last.
      </HomeSectionHeading>

      {error ? (
        <p className="mt-10 text-center text-sm text-gray-500">
          Bestsellers are unavailable right now.
        </p>
      ) : loading ? (
        <ProductGridSkeleton
          count={BESTSELLER_LIMIT}
          className="mt-10 gap-x-4 gap-y-10"
        />
      ) : bestSeller.length === 0 ? (
        <p className="mt-10 text-center text-sm text-gray-500">
          Bestsellers are unavailable right now.
        </p>
      ) : (
        <HomeProductRail products={bestSeller} />
      )}
    </section>
  );
};

export default BestSeller;
